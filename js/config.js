/* ═══════════════════════════════════════════════════════════════
   Wilderness Escape Rentals — THE FACTS
   ───────────────────────────────────────────────────────────────
   Everything a person would ever want to change lives in this file.
   You should never need to open the HTML or the CSS to change a
   price, a phone number, an hour or an address.

   Anything marked TODO(client) is a guess we made and needs
   confirming before this goes live. SAMPLE stays true until every
   TODO is gone — the page flags itself as placeholder while it is.
   ═══════════════════════════════════════════════════════════════ */

const SAMPLE = true;   /* → false only when every TODO(client) below is resolved */

const CONFIG = {

  business: {
    name:    'Wilderness Escape Rentals',
    short:   'Wilderness Escape Rentals',              // TODO(client) — how they answer the phone
    tagline: '',                        // TODO(client) — what they actually do, in their words
    city:    'St. George',
    state:   'Utah',
    region:  'St. George and all of Washington County',
  },

  /* ── CONTACT ─────────────────────────────────────────────────
     Each channel turns itself on the moment it has a real value.
     Leave one null and the site quietly stops offering it rather
     than printing a phone number that rings nowhere.             */
  contact: {
    phone:   null,                      // TODO(client) — '435-555-0100'
    sms:     null,
    email:   null,
    address: null,
    maps:    null,
  },

  hours: {
    // TODO(client) — null means "closed", omit the key to hide the row entirely
    mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null,
  },

  social: {
    instagram: null,
    facebook:  null,
  },

  /* ── THE OFFER ───────────────────────────────────────────────
     Every number the page prints comes from here. Nothing is
     hard-coded in markup — that is the rule the whole file exists
     to enforce.                                                  */
  services: [
    // { name: '', blurb: '', from: null },   // TODO(client)
  ],

};

/* Flag sample data in the UI so nobody mistakes a guess for a fact. */
document.addEventListener('DOMContentLoaded', () => {
  if (!SAMPLE) return;
  const b = document.createElement('div');
  b.className = 'sample-flag';
  b.textContent = 'Sample content · not final';
  document.body.prepend(b);
});
