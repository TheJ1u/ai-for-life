import contextlib
import copy
import io
import os
from pathlib import Path
import tempfile
import unittest
from meeting_calendar import calendar, confirmed_events
import meeting_calendar
from unittest.mock import patch
import json
import html
import re
from urllib.parse import urlsplit, parse_qs
from update_site import PageParser, check_pages


class ValidationTests(unittest.TestCase):
    def test_parser_ignores_comments_and_checks_nested_links(self):
        p = PageParser('<!-- <a href="missing"> --> <a id="x"><a>bad</a></a><p id="x"></p>')
        self.assertEqual(p.errors, ['NESTED LINK', 'DUPLICATE ID: x'])
        self.assertEqual(p.refs, [])

    def test_local_fragments_query_media_and_base(self):
        previous = os.getcwd()
        try:
            with tempfile.TemporaryDirectory(dir=previous) as directory:
                os.chdir(directory)
                Path('index.html').write_text('<h1 id="main">Home</h1><a href="next.html?x=1#yes">Next</a><video poster="poster.jpg"></video>')
                Path('next.html').write_text('<h1 id="yes">Next</h1>')
                Path('404.html').write_text('<base href="/ai-for-life/"><a href="index.html#main">Home</a>')
                Path('poster.jpg').write_bytes(b'fixture')
                with contextlib.redirect_stdout(io.StringIO()):
                    self.assertEqual(check_pages(), 0)
                    Path('next.html').write_text('<h1 id="other">Next</h1><img src="missing.png">')
                    self.assertEqual(check_pages(), 2)
                os.chdir(previous)
        finally:
            os.chdir(previous)


class MeetingTests(unittest.TestCase):
    def setUp(self):
        self.event = dict(id='test-date', start='2026-10-15T16:00:00-06:00', end='2026-10-15T17:00:00-06:00', updated='2026-10-09T10:00:00-06:00', topic='Synthetic test, not a real meeting', location='Test; room')
        self.data = dict(events=[self.event], cancellations=[])

    def test_summer_and_winter_offsets(self):
        self.assertIn('DTSTART:20261015T220000Z', calendar(self.data))
        self.event.update(start='2026-11-05T16:00:00-07:00', end='2026-11-05T17:00:00-07:00')
        self.assertIn('DTSTART:20261105T230000Z', calendar(self.data))

    def test_cancelled_and_unconfirmed_dates_are_not_exported(self):
        self.data['cancellations'] = [dict(id='test-date', reason='test cancellation')]
        self.assertEqual(confirmed_events(self.data), [])
        self.assertNotIn('BEGIN:VEVENT', calendar(self.data))
        self.assertNotIn('RRULE', calendar(self.data))

    def test_exception_time_and_escaping(self):
        self.event.update(start='2026-10-16T12:00:00-06:00', end='2026-10-16T13:00:00-06:00')
        result = calendar(self.data)
        self.assertIn('DTSTART:20261016T180000Z', result)
        self.assertIn('LOCATION:Test\\; room', result)
        self.assertTrue(all(len(line.encode()) <= 75 for line in result.split('\r\n')))

    def test_invalid_dates_and_duplicate_ids_fail(self):
        self.data['events'].append(copy.deepcopy(self.event))
        with self.assertRaises(ValueError):
            confirmed_events(self.data)
        self.data['events'].pop()
        self.event['end'] = self.event['start']
        with self.assertRaises(ValueError):
            confirmed_events(self.data)

    def test_generated_google_link_and_ics_agree(self):
        data = dict(self.data, timezone='America/Denver', joinUrl=None, building=None,
                    room=None, mapUrl=None, topic=None, eligibility='BYU community only')
        with tempfile.TemporaryDirectory(dir=os.getcwd()) as directory:
            root = Path(directory)
            (root / 'assets').mkdir()
            (root / 'meetings.json').write_text(json.dumps(data))
            (root / 'meetings.html').write_text('<!-- meeting-details:start --><!-- meeting-details:end -->')
            for name in ('index.html', 'start.html'):
                (root / name).write_text('<!-- join:start --><!-- join:end -->')
            with patch.object(meeting_calendar, 'ROOT', root):
                meeting_calendar.generate()
            markup = (root / 'meetings.html').read_text()
            url = html.unescape(re.search(r'href="(https://calendar.google.com[^"]+)"', markup)[1])
            self.assertEqual(parse_qs(urlsplit(url).query)['dates'], ['20261015T220000Z/20261015T230000Z'])
            self.assertIn(b'DTSTART:20261015T220000Z', (root / 'assets/ai-for-life-weekly.ics').read_bytes())
            self.assertNotIn('class="btn"', (root / 'index.html').read_text())


if __name__ == '__main__':
    unittest.main()
