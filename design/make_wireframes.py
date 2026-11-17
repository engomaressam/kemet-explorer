"""Generates the low-fidelity wireframes for Kemet Explorer as SVG frames.

Each frame is a 360 x 760 phone screen saved to design/wireframes/<name>.svg.
The SVGs can be dragged straight into Figma, where each one becomes a frame with
editable vector layers. Run: python design/make_wireframes.py
"""
from pathlib import Path

W, H = 360, 760
INK = '#1F2937'
MID = '#6B7280'
LINE = '#9CA3AF'
FILL = '#E5E7EB'
SOFT = '#F3F4F6'
DARK = '#374151'
FONT = 'Inter, Arial, Helvetica, sans-serif'
OUT = Path(__file__).resolve().parent / 'wireframes'


class Frame:
    def __init__(self, name):
        self.name = name
        self.parts = []

    # ---------------------------------------------------------------- primitives
    def rect(self, x, y, w, h, r=6, fill='none', stroke=LINE, sw=1.5, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def text(self, x, y, s, size=13, weight=400, fill=INK, anchor='start'):
        s = s.replace('&', '&amp;').replace('<', '&lt;')
        self.parts.append(f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{s}</text>')

    def line(self, x1, y1, x2, y2, stroke=LINE, sw=1.5):
        self.parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"/>')

    def circle(self, cx, cy, r, fill='none', stroke=LINE, sw=1.5):
        self.parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def bar(self, x, y, w, h=8):
        self.rect(x, y, w, h, r=h / 2, fill=FILL, stroke='none')

    def image(self, x, y, w, h, r=8, label=None):
        self.rect(x, y, w, h, r=r, fill=SOFT, stroke=LINE)
        self.line(x, y, x + w, y + h, stroke=LINE, sw=1)
        self.line(x + w, y, x, y + h, stroke=LINE, sw=1)
        if label:
            self.rect(x + w / 2 - 52, y + h / 2 - 11, 104, 22, r=11, fill='#FFFFFF', stroke=LINE, sw=1)
            self.text(x + w / 2, y + h / 2 + 4, label, size=10, fill=MID, anchor='middle')

    def icon(self, cx, cy, label='', r=11):
        self.circle(cx, cy, r, fill=SOFT, stroke=LINE, sw=1.2)
        if label:
            self.text(cx, cy + 4, label, size=10, weight=700, fill=MID, anchor='middle')

    def note(self, x, y, w, s):
        """Yellow sticky note explaining behaviour, as designers do in Figma."""
        lines = s.split('\n')
        h = 14 + 15 * len(lines)
        self.rect(x, y, w, h, r=4, fill='#FEF3C7', stroke='#F59E0B', sw=1)
        for i, ln in enumerate(lines):
            self.text(x + 8, y + 18 + 15 * i, ln, size=10.5, fill='#92400E')

    # ---------------------------------------------------------------- components
    def status(self):
        self.text(18, 22, '9:41', size=11, weight=700)
        self.rect(W - 46, 12, 26, 12, r=3, stroke=INK, sw=1.2)

    def app_header(self, title='Kemet Explorer', back=False, logo=True, settings=True):
        self.line(0, 84, W, 84, stroke=FILL, sw=1)
        x = 18
        if back:
            self.text(x, 62, '<', size=20, weight=700)
            x += 24
        if logo:
            self.rect(x, 42, 30, 30, r=7, fill=DARK, stroke='none')
            self.text(x + 15, 62, 'K', size=13, weight=700, fill='#FFFFFF', anchor='middle')
            x += 40
        self.text(x, 63, title, size=17, weight=700)
        if settings:
            self.icon(W - 34, 57, 'S', r=15)

    def input(self, y, label, placeholder, trailing=None):
        self.text(24, y, label, size=12, weight=600)
        self.rect(24, y + 8, W - 48, 42, r=8, fill='#FFFFFF')
        self.icon(44, y + 29, '', r=7)
        self.text(60, y + 34, placeholder, size=12.5, fill=LINE)
        if trailing:
            self.text(W - 40, y + 34, trailing, size=11, fill=MID, anchor='middle')

    def button(self, y, label, filled=True, x=24, w=None):
        w = w or W - 48
        self.rect(x, y, w, 44, r=10, fill=DARK if filled else '#FFFFFF', stroke=DARK, sw=1.5)
        self.text(x + w / 2, y + 27, label, size=14, weight=700, fill='#FFFFFF' if filled else DARK, anchor='middle')

    def chips(self, y, labels, selected=0, x=18):
        for i, lab in enumerate(labels):
            w = 14 + 7.2 * len(lab) + 14
            self.rect(x, y, w, 28, r=14, fill=DARK if i == selected else '#FFFFFF', stroke=DARK if i == selected else LINE)
            self.text(x + w / 2, y + 18, lab, size=11.5, weight=600, fill='#FFFFFF' if i == selected else INK, anchor='middle')
            x += w + 8

    def site_card(self, y, title, sub, tag, fav=False):
        self.rect(16, y, W - 32, 86, r=12, fill='#FFFFFF')
        self.image(26, y + 10, 66, 66, r=8)
        self.text(104, y + 28, title, size=14, weight=700)
        self.text(104, y + 46, sub, size=11.5, fill=MID)
        self.rect(104, y + 54, 8 + 6.5 * len(tag), 18, r=5, fill=SOFT, stroke='none')
        self.text(108, y + 67, tag, size=10.5, fill=MID)
        # favourite toggle (filled when saved)
        self.circle(W - 42, y + 24, 9, fill=DARK if fav else 'none', stroke=DARK if fav else LINE, sw=1.5)
        self.circle(W - 42, y + 58, 14, fill=DARK, stroke='none')
        self.text(W - 42, y + 63, '>', size=13, weight=700, fill='#FFFFFF', anchor='middle')

    def tabbar(self, active=0, labels=('Home', 'Live', 'Favourites')):
        self.line(0, H - 62, W, H - 62, stroke=FILL, sw=1)
        for i, lab in enumerate(labels):
            cx = W / 6 + i * W / 3
            self.icon(cx, H - 40, '', r=10)
            self.text(cx, H - 15, lab, size=11, weight=700 if i == active else 400, fill=INK if i == active else MID, anchor='middle')

    def setting_row(self, y, title, desc, kind='chevron', on=True):
        self.icon(38, y + 20, '', r=13)
        self.text(62, y + 17, title, size=13.5, weight=600)
        if desc:
            self.text(62, y + 34, desc, size=11, fill=MID)
        if kind == 'chevron':
            self.text(W - 36, y + 26, '>', size=14, fill=MID, anchor='middle')
        elif kind == 'switch':
            self.rect(W - 66, y + 10, 40, 22, r=11, fill=DARK if on else FILL, stroke='none')
            self.circle(W - 37 if on else W - 55, y + 21, 9, fill='#FFFFFF', stroke='none')
        self.line(24, y + 46, W - 24, y + 46, stroke=FILL, sw=1)

    def section(self, y, label):
        self.text(22, y, label.upper(), size=10.5, weight=700, fill=MID)

    def svg(self):
        body = '\n  '.join(self.parts)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">\n'
                f'  <title>{self.name}</title>\n'
                f'  <rect x="0" y="0" width="{W}" height="{H}" fill="#FFFFFF"/>\n  {body}\n</svg>\n')


# ==================================================================== frames
def login():
    f = Frame('Login')
    f.status()
    f.rect(145, 90, 70, 70, r=16, fill=DARK, stroke='none')
    f.text(180, 133, 'LOGO', size=12, weight=700, fill='#FFFFFF', anchor='middle')
    f.text(180, 190, 'KEMET EXPLORER', size=11, weight=700, fill=MID, anchor='middle')
    f.text(180, 222, 'Welcome back', size=22, weight=800, anchor='middle')
    f.bar(70, 238, 220)
    f.rect(16, 262, W - 32, 356, r=14, fill='#FFFFFF')
    f.rect(24, 276, W - 48, 34, r=8, fill='#FEE2E2', stroke='#EF4444', sw=1, dash='4 3')
    f.text(36, 297, 'Error message area (wrong email or password)', size=10.5, fill='#B91C1C')
    f.input(332, 'Email', 'name@example.com')
    f.input(404, 'Password', 'Your password', trailing='show')
    f.button(472, 'Log In')
    f.line(40, 540, 140, 540)
    f.text(180, 544, 'New here?', size=11, fill=MID, anchor='middle')
    f.line(220, 540, 320, 540)
    f.button(556, 'Sign Up', filled=False, x=40, w=W - 80)
    f.text(180, 644, "Don't have an account? Sign up", size=12.5, fill=MID, anchor='middle')
    f.line(234, 647, 279, 647, stroke=DARK, sw=1.2)
    f.note(24, 670, W - 48, 'Log In: validate fields, check the saved account,\nopen Home. Sign Up / link: go to the Register frame.')
    return f


def register():
    f = Frame('Register')
    f.status()
    f.rect(152, 70, 56, 56, r=13, fill=DARK, stroke='none')
    f.text(180, 103, 'LOGO', size=11, weight=700, fill='#FFFFFF', anchor='middle')
    f.text(180, 164, 'Create your account', size=21, weight=800, anchor='middle')
    f.bar(60, 180, 240)
    f.rect(16, 204, W - 32, 400, r=14, fill='#FFFFFF')
    f.rect(24, 218, W - 48, 52, r=8, fill='#FEE2E2', stroke='#EF4444', sw=1, dash='4 3')
    f.text(36, 238, 'Validation errors listed here', size=10.5, fill='#B91C1C')
    f.text(36, 256, '(empty fields, invalid email, short password)', size=10.5, fill='#B91C1C')
    f.input(292, 'Username', 'e.g. omar_essam')
    f.input(364, 'Email', 'name@example.com')
    f.input(436, 'Password', 'At least 8 characters, a number', trailing='show')
    f.button(510, 'Sign Up')
    f.text(180, 640, 'Already have an account? Log in', size=12.5, fill=MID, anchor='middle')
    f.line(234, 643, 287, 643, stroke=DARK, sw=1.2)
    f.note(24, 670, W - 48, 'Sign Up: save the account to local storage,\nstart a session and open Home.\nLog in link: back to the Login frame.')
    return f


def home():
    f = Frame('Home')
    f.status()
    f.app_header()
    f.text(18, 116, 'Hello, {username}', size=20, weight=800)
    f.bar(18, 128, 250)
    for i, lab in enumerate(['Sites', 'Favourites', 'Visited']):
        x = 18 + i * 110
        f.rect(x, 148, 102, 64, r=10, fill='#FFFFFF')
        f.icon(x + 51, 166, '', r=8)
        f.text(x + 51, 192, '12' if i == 0 else 'n', size=15, weight=800, anchor='middle')
        f.text(x + 51, 206, lab, size=10, fill=MID, anchor='middle')
    f.rect(18, 224, W - 36, 38, r=10, fill='#FFFFFF')
    f.text(46, 248, 'Search sites, cities or regions', size=12, fill=LINE)
    f.icon(34, 243, '', r=6)
    f.chips(274, ['All', 'Pyramids', 'Temples', 'Tombs'])
    f.text(18, 328, 'Site of the day', size=14, weight=700)
    f.image(18, 338, W - 36, 96, r=12, label='site photo')
    f.rect(18, 434, W - 36, 64, r=0, fill=DARK, stroke='none')
    f.text(30, 456, 'Step Pyramid of Djoser', size=14, weight=700, fill='#FFFFFF')
    f.rect(30, 466, 70, 22, r=11, fill='#FFFFFF', stroke='none')
    f.text(65, 481, 'Explore >', size=10.5, weight=700, fill=DARK, anchor='middle')
    f.text(18, 522, 'All sites (12)', size=14, weight=700)
    f.site_card(532, 'Abu Simbel Temples', 'Abu Simbel, Aswan', 'Temples')
    f.site_card(626, 'Dendera Temple', 'Dendera, Qena', 'Temples')
    f.circle(W - 46, 642, 22, fill='#FFFFFF', stroke=DARK, sw=2)
    f.text(W - 46, 647, 'FAB', size=9.5, weight=700, fill=DARK, anchor='middle')
    f.rect(0, H - 62, W, 62, r=0, fill='#FFFFFF', stroke='none')
    f.tabbar(0)
    return f


def detail():
    f = Frame('Detail')
    f.status()
    f.app_header('Abu Simbel Temples', back=True, logo=False)
    f.image(16, 96, W - 32, 150, r=12, label='photo (Wikipedia API)')
    f.text(16, 274, 'Abu Simbel Temples', size=20, weight=800)
    f.text(16, 293, 'Abu Simbel, Aswan - Aswan & Nubia', size=11.5, fill=MID)
    f.chips(302, ['Temples', 'New Kingdom'], selected=-1, x=16)
    for i, lab in enumerate(['Favourite', 'Visited', 'Share']):
        x = 16 + i * 112
        f.rect(x, 342, 104, 52, r=10, fill='#FFFFFF')
        f.icon(x + 52, 360, '', r=8)
        f.text(x + 52, 384, lab, size=11, weight=600, anchor='middle')
    f.rect(16, 406, W - 32, 62, r=10, fill='#FFFFFF')
    f.icon(40, 430, '', r=11)
    f.text(60, 426, 'Right now at Abu Simbel', size=10.5, fill=MID)
    f.text(60, 443, '31 C, Clear sky (Open-Meteo)', size=13, weight=700)
    f.bar(28, 454, 250, 6)
    f.text(16, 494, 'About', size=14, weight=700)
    for i, w in enumerate([320, 300, 250]):
        f.bar(16, 504 + i * 14, w)
    f.text(16, 562, 'Highlights', size=14, weight=700)
    for i, w in enumerate([270, 240]):
        f.icon(22, 578 + i * 16, '', r=4)
        f.bar(32, 574 + i * 16, w)
    f.text(16, 626, 'From Wikipedia', size=14, weight=700)
    f.bar(16, 636, 310)
    f.text(16, 668, 'More in Aswan & Nubia', size=14, weight=700)
    f.rect(16, 678, 130, 34, r=8, fill='#FFFFFF')
    f.rect(154, 678, 130, 34, r=8, fill='#FFFFFF')
    f.button(718, 'Back to all sites', filled=False, x=16, w=W - 32)
    return f


def favourites():
    f = Frame('Favourites (saved data)')
    f.status()
    f.app_header()
    f.text(18, 116, 'My favourites', size=20, weight=800)
    f.bar(18, 128, 260)
    f.rect(16, 148, W - 32, 74, r=12, fill='#FFFFFF')
    f.icon(36, 170, '', r=8)
    f.text(52, 174, 'Explorer progress', size=13, weight=700)
    f.text(W - 30, 174, '2 / 12', size=13, weight=700, anchor='end')
    f.rect(30, 186, W - 60, 8, r=4, fill=FILL, stroke='none')
    f.rect(30, 186, 50, 8, r=4, fill=DARK, stroke='none')
    f.bar(30, 204, 200, 6)
    f.text(18, 248, 'Favourite sites (4)', size=14, weight=700)
    f.site_card(258, 'Pyramids of Giza', 'Giza', 'Pyramids', fav=True)
    f.site_card(352, 'Karnak Temple', 'Luxor', 'Temples', fav=True)
    f.site_card(446, 'Valley of the Kings', 'Luxor West Bank', 'Tombs', fav=True)
    f.site_card(540, 'Abu Simbel Temples', 'Abu Simbel', 'Temples', fav=True)
    f.note(24, 636, W - 48, 'Read from local storage on open:\nkemet:favorites:<userId>, kemet:visited:<userId>.')
    f.tabbar(2)
    return f


def integrate_api():
    f = Frame('Integrate API (Live)')
    f.status()
    f.app_header()
    f.text(18, 116, 'Live conditions', size=20, weight=800)
    f.bar(18, 128, 290)
    f.text(18, 160, 'Updated 16:35 (Cairo)', size=11, fill=MID)
    f.button(140, 'Refresh', filled=False, x=W - 120, w=102)
    for i, (lab, t) in enumerate([('Warmest now', '31 C'), ('Coolest now', '24 C')]):
        x = 16 + i * 168
        f.rect(x, 196, 160, 74, r=10, fill='#FFFFFF')
        f.text(x + 12, 220, lab, size=10.5, fill=MID)
        f.bar(x + 12, 230, 110)
        f.text(x + 12, 260, t, size=17, weight=800)
    for k, name in enumerate(['Pyramids of Giza', 'Great Sphinx of Giza', 'Karnak Temple']):
        y = 284 + k * 126
        f.rect(16, y, W - 32, 116, r=12, fill='#FFFFFF')
        f.icon(44, y + 28, '', r=16)
        f.text(70, y + 26, name, size=14, weight=700)
        f.text(70, y + 42, 'condition', size=11, fill=MID)
        f.text(W - 30, y + 36, '24 C', size=18, weight=800, anchor='end')
        f.bar(28, y + 60, 90, 6)
        f.bar(140, y + 60, 80, 6)
        f.bar(250, y + 60, 80, 6)
        f.rect(28, y + 80, W - 56, 24, r=6, fill=SOFT, stroke='none')
        f.text(38, y + 96, 'Visit tip from temperature and wind', size=10.5, fill=MID)
    f.note(24, 664 - 10, W - 48, 'GET api.open-meteo.com/v1/forecast for all 12 sites;\nloading, error and cached states; heat alerts.')
    f.tabbar(1)
    return f


def menu():
    f = Frame('Menu (Settings menu)')
    f.status()
    f.text(18, 62, '<', size=20, weight=700)
    f.text(44, 63, 'Settings', size=17, weight=700)
    f.line(0, 84, W, 84, stroke=FILL, sw=1)
    f.rect(16, 100, W - 32, 84, r=14, fill=DARK, stroke='none')
    f.circle(56, 142, 26, fill='#9CA3AF', stroke='none')
    f.text(56, 147, 'OM', size=13, weight=800, fill='#FFFFFF', anchor='middle')
    f.text(94, 134, 'Hello, {username}!', size=16, weight=800, fill='#FFFFFF')
    f.text(94, 152, 'email@example.com', size=11, fill='#E5E7EB')
    f.text(94, 168, 'Member since month year', size=10.5, fill='#E5E7EB')
    f.section(212, 'Account')
    f.rect(16, 220, W - 32, 50, r=12, fill='#FFFFFF')
    f.setting_row(222, 'Profile & account', 'Username, email and password')
    f.section(296, 'Preferences')
    f.rect(16, 304, W - 32, 98, r=12, fill='#FFFFFF')
    f.setting_row(306, 'Appearance & preferences', 'Theme, units, sorting')
    f.setting_row(354, 'Notifications & reminders', 'On, daily reminder at 07:00')
    f.section(428, 'Privacy & support')
    f.rect(16, 436, W - 32, 98, r=12, fill='#FFFFFF')
    f.setting_row(438, 'Privacy & stored data', 'What the app saves on this device')
    f.setting_row(486, 'About Kemet Explorer', 'Version, data sources')
    f.rect(16, 554, W - 32, 50, r=12, fill='#FFFFFF', stroke='#EF4444')
    f.icon(38, 579, '', r=13)
    f.text(62, 584, 'Log out', size=13.5, weight=700, fill='#B91C1C')
    f.note(24, 630, W - 48, 'Opened from the settings icon in the header\nof Home, Live, Favourites and Detail.')
    return f


def settings():
    f = Frame('Settings (Appearance & preferences)')
    f.status()
    f.text(18, 62, '<', size=20, weight=700)
    f.text(44, 63, 'Appearance & preferences', size=16, weight=700)
    f.line(0, 84, W, 84, stroke=FILL, sw=1)
    f.rect(16, 96, W - 32, 30, r=8, fill='#DCFCE7', stroke='#22C55E', sw=1, dash='4 3')
    f.text(30, 115, 'Saved confirmation ("Theme saved.")', size=10.5, fill='#166534')
    f.section(150, 'Appearance')
    f.rect(16, 158, W - 32, 114, r=12, fill='#FFFFFF')
    f.setting_row(160, 'Dark mode', 'Easier on the eyes at night', kind='switch', on=False)
    f.text(28, 226, 'Text size', size=13, weight=600)
    f.chips(234, ['Small', 'Medium', 'Large'], selected=1, x=28)
    f.section(296, 'Units')
    f.rect(16, 304, W - 32, 78, r=12, fill='#FFFFFF')
    f.text(28, 326, 'Temperature', size=13, weight=600)
    f.chips(338, ['Celsius (C)', 'Fahrenheit (F)'], selected=0, x=28)
    f.section(406, 'Home screen')
    f.rect(16, 414, W - 32, 190, r=12, fill='#FFFFFF')
    f.text(28, 436, 'Default category', size=13, weight=600)
    f.chips(446, ['All', 'Pyramids', 'Temples', 'Tombs'], selected=0, x=28)
    f.text(28, 500, 'Sort sites by', size=13, weight=600)
    f.chips(510, ['Name', 'Region', 'Oldest first'], selected=0, x=28)
    f.setting_row(552, 'Show site photos', 'Turn off to save mobile data', kind='switch', on=True)
    f.button(624, 'Reset to defaults', filled=False, x=16, w=W - 32)
    f.note(24, 682, W - 48, 'Each change applies at once and is saved\nper user: kemet:settings:<userId>.')
    return f


def notifications():
    f = Frame('Notifications')
    f.status()
    f.text(18, 62, '<', size=20, weight=700)
    f.text(44, 63, 'Notifications', size=17, weight=700)
    f.line(0, 84, W, 84, stroke=FILL, sw=1)
    f.rect(16, 98, W - 32, 58, r=12, fill='#FFFFFF')
    f.icon(42, 127, '', r=12)
    f.text(64, 122, 'Notification permission', size=11, fill=MID)
    f.text(64, 140, 'Allowed / Not requested', size=14, weight=700)
    f.button(105, 'Allow', filled=False, x=W - 104, w=80)
    f.section(182, 'Notifications')
    f.rect(16, 190, W - 32, 194, r=12, fill='#FFFFFF')
    f.setting_row(192, 'Enable notifications', 'Master switch', kind='switch', on=True)
    f.setting_row(240, 'Daily discovery reminder', 'A new site every day', kind='switch', on=True)
    f.setting_row(288, 'Heat alerts for favourites', 'When a saved site reaches 38 C', kind='switch', on=True)
    f.setting_row(336, 'News and feature tips', 'Optional', kind='switch', on=False)
    f.section(410, 'Reminder time')
    f.rect(16, 418, W - 32, 130, r=12, fill='#FFFFFF')
    f.chips(430, ['07:00', '09:00', '12:00', '18:00'], selected=0, x=28)
    f.rect(28, 470, 200, 40, r=8, fill=SOFT)
    f.text(40, 495, 'HH:MM', size=12.5, fill=LINE)
    f.button(468, 'Set time', filled=False, x=238, w=94)
    f.bar(28, 526, 240, 6)
    f.button(562, 'Send test notification')
    f.section(632, 'Recent notifications')
    f.rect(16, 640, W - 32, 56, r=12, fill='#FFFFFF')
    f.icon(40, 668, '', r=12)
    f.text(62, 664, 'Kemet Explorer test notification', size=12.5, weight=600)
    f.text(62, 681, 'time - delivered by the system', size=10.5, fill=MID)
    f.note(24, 704, W - 48, 'Test fires in 5 s: banner in the app + system alert.')
    return f


FRAMES = [login, register, home, detail, favourites, integrate_api, menu, settings, notifications]

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for i, make in enumerate(FRAMES, 1):
        frame = make()
        slug = frame.name.split(' (')[0].lower().replace(' ', '-')
        path = OUT / f'{i:02d}-{slug}.svg'
        path.write_text(frame.svg(), encoding='utf-8')
        print('wrote', path.name)
