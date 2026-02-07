/**
 * ESC/POS Command Constants
 * Standard ESC/POS commands for thermal printers
 */

// Control commands
export const ESC = 0x1b;
export const GS = 0x1d;
export const LF = 0x0a;

// Initialize printer
export const INIT = Buffer.from([ESC, 0x40]);

// Text formatting
export const TEXT_NORMAL = Buffer.from([ESC, 0x21, 0x00]);
export const TEXT_BOLD_ON = Buffer.from([ESC, 0x45, 0x01]);
export const TEXT_BOLD_OFF = Buffer.from([ESC, 0x45, 0x00]);
export const TEXT_DOUBLE_HEIGHT = Buffer.from([ESC, 0x21, 0x10]);
export const TEXT_DOUBLE_WIDTH = Buffer.from([ESC, 0x21, 0x20]);
export const TEXT_DOUBLE_SIZE = Buffer.from([ESC, 0x21, 0x30]);

// Alignment
export const ALIGN_LEFT = Buffer.from([ESC, 0x61, 0x00]);
export const ALIGN_CENTER = Buffer.from([ESC, 0x61, 0x01]);
export const ALIGN_RIGHT = Buffer.from([ESC, 0x61, 0x02]);

// Paper handling
export const FEED_LINE = Buffer.from([LF]);
export const FEED_LINES = (n: number) => Buffer.from([ESC, 0x64, n]);
export const CUT_PAPER = Buffer.from([GS, 0x56, 0x00]);
export const CUT_PAPER_PARTIAL = Buffer.from([GS, 0x56, 0x01]);

// Cash drawer
export const CASH_DRAWER_KICK = Buffer.from([ESC, 0x70, 0x00, 0x19, 0xfa]);

// Character settings
export const CHARSET_PC437 = Buffer.from([ESC, 0x74, 0x00]);
export const CHARSET_PC850 = Buffer.from([ESC, 0x74, 0x02]);

// Line spacing
export const LINE_SPACING_DEFAULT = Buffer.from([ESC, 0x32]);
export const LINE_SPACING = (n: number) => Buffer.from([ESC, 0x33, n]);
