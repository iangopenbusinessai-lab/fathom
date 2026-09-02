// Outbound links. One file, so swapping a placeholder for the real thing is a
// one-line change here rather than a hunt through components.

// The feedback form. There is no real form yet, so this is a clearly-marked
// placeholder: when the Google Form exists, replace this string with its URL
// and nothing else needs to change.
//
// Keep the PLACEHOLDER sentinel in the value until it is real - the top bar
// reads it (see feedbackReady) and shows the button as not-yet-available
// rather than sending anyone to a dead link.
export const FEEDBACK_FORM_URL = 'https://forms.gle/PLACEHOLDER-fathom-feedback';

export function feedbackReady(): boolean {
  return !FEEDBACK_FORM_URL.includes('PLACEHOLDER');
}
