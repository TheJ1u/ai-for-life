"""Generate published meeting details and a finite calendar from organizer-confirmed dates."""
import datetime as dt
import html
import json
import re
from pathlib import Path
from urllib.parse import urlencode, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def safe_url(value):
    if value and urlsplit(value).scheme not in ('https', 'http', 'mailto'):
        raise ValueError('Use an absolute https, http, or mailto URL')
    return value


def confirmed_events(data):
    cancelled = {entry['id'] for entry in data['cancellations']}
    seen = set()
    result = []
    for event in data['events']:
        if not re.fullmatch(r'[A-Za-z0-9_-]+', event['id']) or event['id'] in seen:
            raise ValueError('Meeting IDs must be unique letters, digits, underscores or hyphens')
        seen.add(event['id'])
        start, end = (dt.datetime.fromisoformat(event[key]) for key in ('start', 'end'))
        if start.utcoffset() is None or end.utcoffset() is None or end <= start:
            raise ValueError('Meeting dates require explicit Mountain UTC offsets and end after start')
        if event['id'] not in cancelled:
            result.append(event)
    return sorted(result, key=lambda event: dt.datetime.fromisoformat(event['start']))


def stamp(value):
    return dt.datetime.fromisoformat(value).astimezone(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')


def ics_text(value):
    return value.replace('\\', '\\\\').replace('\n', '\\n').replace(';', '\\;').replace(',', '\\,').replace('\r', '')


def calendar(data):
    lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AI For Life//Confirmed meetings//EN', 'CALSCALE:GREGORIAN']
    for event in confirmed_events(data):
        lines += ['BEGIN:VEVENT', 'UID:' + event['id'] + '@ai-for-life',
                  'DTSTAMP:' + stamp(event['updated']), 'DTSTART:' + stamp(event['start']),
                  'DTEND:' + stamp(event['end']), 'SUMMARY:' + ics_text(event['topic']),
                  'LOCATION:' + ics_text(event['location']),
                  'DESCRIPTION:Check https://thej1u.github.io/ai-for-life/meetings.html before attending. Imported calendars do not update automatically.',
                  'END:VEVENT']
    lines += ['END:VCALENDAR']
    # RFC 5545 limits physical lines to 75 octets; never split a UTF-8 character.
    folded = []
    for line in lines:
        part = ''
        for char in line:
            if len((part + char).encode('utf-8')) > 75:
                folded.append(part)
                part = ' '
            part += char
        folded.append(part)
    return '\r\n'.join(folded) + '\r\n'


def generate():
    data = json.loads((ROOT / 'meetings.json').read_text(encoding='utf-8'))
    events = confirmed_events(data)
    for key in ('joinUrl', 'mapUrl'):
        safe_url(data[key])
    h = html.escape
    fields = [('Building', 'building'), ('Room', 'room'), ('Next topic', 'topic'), ('Attendance requirements', 'eligibility')]
    details = '<section id="meeting-details"><h2>Before you attend</h2><dl>'
    details += ''.join(f'<dt>{label}</dt><dd>{h(data[key] or "[Awaiting organizer confirmation]")}</dd>' for label, key in fields)
    details += '</dl>'
    details += (f'<p><a href="{h(data["mapUrl"], quote=True)}">Meeting location map</a></p>' if data['mapUrl'] else '<p>Map: [Awaiting confirmed building and room].</p>')
    details += '<p>AI For Life is for the BYU community only.</p><h2>Confirmed dates and calendar</h2>'
    if events:
        details += '<ul>'
        for event in events:
            params = urlencode({'action': 'TEMPLATE', 'text': event['topic'], 'dates': stamp(event['start']) + '/' + stamp(event['end']), 'ctz': data['timezone'], 'location': event['location'], 'details': 'Check https://thej1u.github.io/ai-for-life/meetings.html before attending. Calendar copies do not update automatically.'})
            details += f'<li>{h(event["start"])} — {h(event["topic"])}; {h(event["location"])}. <a href="https://calendar.google.com/calendar/render?{h(params)}">Add this meeting to Google Calendar</a></li>'
        details += '</ul><p><a class="btn" href="assets/ai-for-life-weekly.ics" download>Download confirmed dates for Apple or Outlook</a></p>'
    else:
        details += '<p>No individual dates have been confirmed yet. The weekly schedule remains Thursdays, 4–5 PM Mountain at BYU. Calendar downloads will appear here when the organizer confirms dates.</p>'
    details += '<p class="note">Calendar imports are snapshots, not subscriptions. Recheck this page before traveling and remove cancelled events from your calendar. No indefinite weekly recurrence is exported.</p>'
    details += '<h3>Cancellations and changes</h3>'
    details += ('<ul>' + ''.join(f'<li>{h(c["id"])}: {h(c["reason"])}</li>' for c in data['cancellations']) + '</ul>' if data['cancellations'] else '<p>No cancellations have been supplied. This does not confirm any unlisted meeting date.</p>')
    details += '</section>'
    p = ROOT / 'meetings.html'
    content = p.read_text(encoding='utf-8')
    content = re.sub(r'<!-- meeting-details:start -->.*?<!-- meeting-details:end -->', '<!-- meeting-details:start -->\n' + details + '\n<!-- meeting-details:end -->', content, flags=re.S)
    p.write_text(content, encoding='utf-8')
    (ROOT / 'assets/ai-for-life-weekly.ics').write_bytes(calendar(data).encode('utf-8'))
    for name in ('index.html', 'start.html'):
        p = ROOT / name
        content = p.read_text(encoding='utf-8')
        join = '<section class="banner join-panel" id="join"><h2>Join the club</h2>'
        join += (f'<p><a class="btn" href="{h(data["joinUrl"], quote=True)}">Join the club</a></p>' if data['joinUrl'] else '<p>[Official signup or club chat link awaiting organizer confirmation.]</p>')
        join += '<p><a href="meetings.html#meeting-details">Check meeting details and attendance requirements</a>.</p></section>'
        content = re.sub(r'<!-- join:start -->.*?<!-- join:end -->', '<!-- join:start -->' + join + '<!-- join:end -->', content, flags=re.S)
        p.write_text(content, encoding='utf-8')


if __name__ == '__main__':
    generate()
