// The printer's error codes (Canon support codes) with what they mean and how
// to fix them, in every UI language. The printer sends the codes itself (the
// DOC: and DSC: fields of its status); the firmware lists them in
// printer.codes. Source for the iP2700 family: Canon's Simplified Service
// Manual QY8-13CR-000 (2010), see docs/ma-loi-ip2700.md.
import { i18n } from './i18n.svelte';
import type { Locale } from './i18n';

export interface ErrorGuide {
  title: string;
  cause: string;
  steps: string[]; // in order
  service?: boolean; // a technician if the steps do not help
  blink?: string; // what the printer's lamps show
}
type Guides = Record<string, ErrorGuide>; // '*': a code that is not in the table

const EN_RESUME = 'the RESUME/CANCEL button (the triangle in a circle)';
const en: Guides = {
  '1000': {
    title: 'Out of paper',
    cause: 'The rear tray is empty, or the paper does not feed.',
    steps: ['Load paper in the rear tray, fan the stack and slide the guide against its edge.', `Press ${EN_RESUME} to go on.`],
    blink: 'Alarm lamp flashes orange 2 times',
  },
  '1200': {
    title: 'Cover open',
    cause: 'The top cover is not closed.',
    steps: ['Close the top cover. Printing goes on by itself.'],
  },
  '1300': {
    title: 'Paper jam',
    cause: 'Paper is jammed inside the printer.',
    steps: [
      'Pull the paper out slowly, the way it comes out at the front. If you cannot see it, open the cover and look inside.',
      'Make sure no torn piece is left inside.',
      `Load paper again and press ${EN_RESUME}. Printing resumes from the next sheet.`,
    ],
    blink: 'Alarm lamp flashes orange 3 times',
  },
  '1687': {
    title: 'Ink cartridge not seated',
    cause: 'The cartridge is not locked in the holder.',
    steps: [
      'Open the cover. Push the cartridge locking cover down firmly until it clicks.',
      'Check that the cartridge sits right, then close the cover.',
      'If the error stays, the cartridge may be faulty: try another one.',
    ],
    blink: 'Alarm lamp flashes orange 4 times',
  },
  '1401': {
    title: 'Ink cartridge not installed',
    cause: 'The printer does not see the black or the colour cartridge.',
    steps: ['Open the cover and install the missing cartridge: black on the left, colour on the right.', 'If the error stays, the cartridge may be faulty: try another one.'],
    blink: 'Alarm lamp flashes orange 5 times',
  },
  '1403': {
    title: 'Cartridge temperature sensor error',
    cause: 'The cartridge chip reports an error.',
    steps: ['Take the cartridge out, wipe the copper contacts with a dry cloth and put it back.', 'If the error stays, replace the cartridge.'],
    blink: 'Alarm lamp flashes orange 5 times',
  },
  '1485': {
    title: 'Unsupported ink cartridge',
    cause: 'The cartridge is not a type this printer takes.',
    steps: ['Use the cartridges made for this printer: {cartridges}.', 'If the error stays, replace the cartridge.'],
    blink: 'Alarm lamp flashes orange 5 times',
  },
  '1486': {
    title: 'Cartridge in the wrong position',
    cause: 'Black and colour are swapped.',
    steps: ['Cancel the print job if one is running.', 'Put them in the right slots: black on the left, colour on the right.'],
    blink: 'Alarm lamp flashes orange 7 times',
  },
  '1487': {
    title: 'Two cartridges of the same type',
    cause: 'Two black or two colour cartridges are installed.',
    steps: ['Replace one of them with the missing type. Only one cartridge of each type.'],
    blink: 'Alarm lamp flashes orange 7 times',
  },
  '1700': {
    title: 'Ink absorber almost full',
    cause: 'The waste ink pad inside the printer is nearly full. This is a warning: printing still works.',
    steps: [
      `Press ${EN_RESUME} to go on printing.`,
      'Have the ink absorber replaced and its counter reset at a service centre soon. Once it is full, the printer stops (error 5B00).',
    ],
    blink: 'Alarm lamp flashes orange 8 times',
  },
  '1686': {
    title: 'Ink level unknown',
    cause: 'The cartridge was refilled or has run out; the printer cannot measure its ink.',
    steps: [
      'Best: install a new cartridge.',
      `To print anyway: hold ${EN_RESUME} for at least 5 seconds. The printer stops tracking the ink of that cartridge and shows "unknown" from then on.`,
    ],
    blink: 'Alarm lamp flashes orange 13 times',
  },
  '1684': {
    title: 'Cartridge not recognised (region)',
    cause: 'The cartridge was sold for another region; its region code does not match the printer.',
    steps: ['Install a cartridge for the region the printer was sold in.', 'If the error stays, replace the cartridge.'],
    blink: 'Alarm lamp flashes orange 14 times',
  },
  '1682': {
    title: 'Cartridge hardware error',
    cause: 'The printer cannot read the cartridge chip.',
    steps: ['Take the cartridge out, wipe the copper contacts with a dry cloth and put it back.', 'If the error stays, replace the cartridge.'],
    blink: 'Alarm lamp flashes orange 15 times',
  },
  '1688': {
    title: 'Out of ink',
    cause: 'The black or the colour cartridge is empty.',
    steps: [
      'Install a new cartridge and close the cover.',
      `To print anyway: hold ${EN_RESUME} for at least 5 seconds with the cartridge installed. The printer stops tracking its ink; printing with an empty cartridge can damage the print head.`,
    ],
    blink: 'Alarm lamp flashes orange 16 times',
  },
  '5100': {
    title: 'Carriage error',
    cause: 'Something blocks the print head carriage, or the encoder strip is dirty.',
    steps: [
      'Turn the printer off. Open the cover and remove jammed paper, foreign objects and any protective tape left inside.',
      'Gently wipe the clear plastic strip that runs across behind the carriage with a dry, lint-free cloth.',
      'Close the cover and turn the printer on again.',
    ],
    service: true,
    blink: 'Alarm and Power lamps flash alternately 2 times',
  },
  '6000': {
    title: 'Line feed error',
    cause: 'The paper feed encoder signal is wrong.',
    steps: ['Turn the printer off. Remove all paper and foreign objects from the paper path.', 'Turn it on again.'],
    service: true,
    blink: 'Alarm and Power lamps flash alternately 3 times',
  },
  '5700': {
    title: 'Paper tray sensor error',
    cause: 'The rear tray cam sensor reports an error.',
    steps: ['Turn the printer off. Check that nothing is stuck in the rear tray.', 'Turn it on again.'],
    service: true,
    blink: 'Alarm and Power lamps flash alternately 5 times',
  },
  '5400': {
    title: 'Internal temperature error',
    cause: 'The printer is too hot, or its temperature sensor is faulty.',
    steps: ['Turn the printer off and let it cool for 15 to 30 minutes somewhere airy.', 'Turn it on again.'],
    service: true,
    blink: 'Alarm and Power lamps flash alternately 6 times',
  },
  '5B00': {
    title: 'Ink absorber full',
    cause: 'The waste ink pad is full; the printer refuses to print so that ink does not leak.',
    steps: ['This cannot be cleared with the buttons.', 'A technician replaces the ink absorber and resets its counter with the Canon Service Tool.'],
    service: true,
    blink: 'Alarm and Power lamps flash alternately 7 times',
  },
  '5B01': {
    title: 'Ink absorber full',
    cause: 'The waste ink pad is full; the printer refuses to print so that ink does not leak.',
    steps: ['This cannot be cleared with the buttons.', 'A technician replaces the ink absorber and resets its counter with the Canon Service Tool.'],
    service: true,
    blink: 'Alarm and Power lamps flash alternately 7 times',
  },
  '5200': {
    title: 'Print head overheating',
    cause: 'The print head got too hot, usually because a cartridge is empty or faulty.',
    steps: ['Turn the printer off and let it cool for a few minutes.', 'Check that the cartridges have ink. Take them out and put them back.', 'Turn it on again.'],
    service: true,
    blink: 'Alarm and Power lamps flash alternately 8 times',
  },
  '6800': {
    title: 'EEPROM error',
    cause: 'The printer cannot read or write its memory.',
    steps: ['Turn the printer off, unplug it for a minute, plug it in and turn it on.'],
    service: true,
    blink: 'Alarm and Power lamps flash alternately 9 times',
  },
  '6801': {
    title: 'EEPROM error',
    cause: 'The printer cannot read or write its memory.',
    steps: ['Turn the printer off, unplug it for a minute, plug it in and turn it on.'],
    service: true,
    blink: 'Alarm and Power lamps flash alternately 9 times',
  },
  B200: {
    title: 'Print head voltage error',
    cause: 'The print head voltage is wrong, usually a faulty or shorted cartridge.',
    steps: [
      'Turn the printer off and unplug it.',
      'Take both cartridges out, dry their contacts, and put them back one at a time to find the one causing it.',
      'Turn it on again.',
    ],
    service: true,
    blink: 'Alarm and Power lamps flash alternately 10 times',
  },
  '*': {
    title: 'No guide for this code yet',
    cause: 'The printer reports a code that is not in the table.',
    steps: ['Turn the printer off and on, then print again.', 'If it stays, look the code up on Canon’s support site or contact a service centre.'],
  },
};

const VI_RESUME = 'nút RESUME/CANCEL (nút có hình tam giác trong vòng tròn)';
const vi: Guides = {
  '1000': {
    title: 'Hết giấy',
    cause: 'Khay sau không có giấy, hoặc giấy không kéo vào được.',
    steps: ['Nạp giấy vào khay sau, vỗ đều xấp giấy và chỉnh thanh dẫn sát mép giấy.', `Bấm ${VI_RESUME} để in tiếp.`],
    blink: 'Đèn Alarm nháy cam 2 lần',
  },
  '1200': {
    title: 'Nắp máy đang mở',
    cause: 'Nắp trên của máy chưa đóng.',
    steps: ['Đóng nắp trên của máy. Máy tự in tiếp.'],
  },
  '1300': {
    title: 'Kẹt giấy',
    cause: 'Giấy bị kẹt trong máy.',
    steps: [
      'Kéo giấy kẹt ra từ từ, theo chiều giấy đi ra phía trước. Nếu không thấy, mở nắp và nhìn trong máy.',
      'Kiểm tra không còn mẩu giấy vụn trong máy.',
      `Nạp lại giấy và bấm ${VI_RESUME}. Máy in tiếp từ tờ kế tiếp.`,
    ],
    blink: 'Đèn Alarm nháy cam 3 lần',
  },
  '1687': {
    title: 'Hộp mực lắp chưa khớp',
    cause: 'Hộp mực chưa được cài chặt vào xe mực.',
    steps: [
      'Mở nắp máy. Ấn chặt nắp khoá hộp mực xuống cho đến khi nghe tiếng khớp.',
      'Kiểm tra hộp mực đã nằm đúng, đóng nắp máy.',
      'Nếu vẫn lỗi, hộp mực có thể hỏng. Thay hộp khác.',
    ],
    blink: 'Đèn Alarm nháy cam 4 lần',
  },
  '1401': {
    title: 'Chưa lắp hộp mực',
    cause: 'Máy không thấy hộp mực đen hoặc màu.',
    steps: ['Mở nắp, lắp hộp mực còn thiếu vào đúng vị trí: đen bên trái, màu bên phải.', 'Nếu vẫn lỗi, hộp mực có thể hỏng. Thay hộp khác.'],
    blink: 'Đèn Alarm nháy cam 5 lần',
  },
  '1403': {
    title: 'Lỗi cảm biến nhiệt hộp mực',
    cause: 'Chip của hộp mực báo lỗi.',
    steps: ['Tháo hộp mực ra, lau sạch chân tiếp xúc màu đồng bằng khăn khô, lắp lại.', 'Nếu vẫn lỗi, thay hộp mực.'],
    blink: 'Đèn Alarm nháy cam 5 lần',
  },
  '1485': {
    title: 'Hộp mực không hỗ trợ',
    cause: 'Hộp mực không đúng loại dùng cho máy này.',
    steps: ['Dùng đúng loại hộp mực của máy này: {cartridges}.', 'Nếu vẫn lỗi, thay hộp mực.'],
    blink: 'Đèn Alarm nháy cam 5 lần',
  },
  '1486': {
    title: 'Hộp mực sai vị trí',
    cause: 'Hộp đen và hộp màu lắp ngược chỗ.',
    steps: ['Nếu đang in, huỷ lệnh in.', 'Lắp lại đúng vị trí: đen bên trái, màu bên phải.'],
    blink: 'Đèn Alarm nháy cam 7 lần',
  },
  '1487': {
    title: 'Hai hộp mực cùng loại',
    cause: 'Đang lắp hai hộp đen hoặc hai hộp màu.',
    steps: ['Thay một hộp bằng đúng loại còn thiếu. Mỗi loại chỉ dùng một hộp.'],
    blink: 'Đèn Alarm nháy cam 7 lần',
  },
  '1700': {
    title: 'Bộ thấm mực sắp đầy',
    cause: 'Miếng thấm mực thải trong máy gần đầy. Đây là cảnh báo, máy vẫn in được.',
    steps: [
      `Bấm ${VI_RESUME} để in tiếp.`,
      'Sớm mang máy đến trung tâm bảo hành để thay bộ thấm mực và reset bộ đếm. Khi đầy hẳn, máy sẽ ngừng in (lỗi 5B00).',
    ],
    blink: 'Đèn Alarm nháy cam 8 lần',
  },
  '1686': {
    title: 'Không xác định được lượng mực',
    cause: 'Hộp mực đã bơm lại hoặc đã hết, máy không đo được mức mực.',
    steps: [
      'Cách tốt nhất: thay hộp mực mới.',
      `Để in tiếp mà không thay: giữ ${VI_RESUME} ít nhất 5 giây. Máy sẽ tắt dò mực cho hộp này và từ đó mức mực luôn hiện "không rõ".`,
    ],
    blink: 'Đèn Alarm nháy cam 13 lần',
  },
  '1684': {
    title: 'Hộp mực sai vùng',
    cause: 'Hộp mực bán cho thị trường khác, mã vùng không khớp với máy.',
    steps: ['Lắp hộp mực đúng vùng bán của máy.', 'Nếu vẫn lỗi, thay hộp mực.'],
    blink: 'Đèn Alarm nháy cam 14 lần',
  },
  '1682': {
    title: 'Lỗi phần cứng hộp mực',
    cause: 'Máy không đọc được chip của hộp mực.',
    steps: ['Tháo hộp mực ra, lau sạch chân tiếp xúc màu đồng bằng khăn khô, lắp lại.', 'Nếu vẫn lỗi, thay hộp mực.'],
    blink: 'Đèn Alarm nháy cam 15 lần',
  },
  '1688': {
    title: 'Hết mực',
    cause: 'Hộp mực đen hoặc màu đã cạn.',
    steps: [
      'Thay hộp mực mới rồi đóng nắp máy.',
      `Nếu muốn in cố: giữ ${VI_RESUME} ít nhất 5 giây với hộp mực vẫn lắp trong máy. Máy sẽ tắt dò mực. In khi hết mực có thể làm hỏng đầu phun.`,
    ],
    blink: 'Đèn Alarm nháy cam 16 lần',
  },
  '5100': {
    title: 'Lỗi xe mực',
    cause: 'Xe mực bị cản khi di chuyển, hoặc dải phim encoder bẩn.',
    steps: [
      'Tắt máy. Mở nắp, lấy hết giấy kẹt, vật lạ, băng dính bảo vệ còn sót trong máy.',
      'Lau nhẹ dải phim trong suốt chạy ngang phía sau xe mực bằng khăn khô không xơ.',
      'Đóng nắp, bật lại máy.',
    ],
    service: true,
    blink: 'Đèn Alarm và Power nháy luân phiên 2 lần',
  },
  '6000': {
    title: 'Lỗi kéo giấy',
    cause: 'Tín hiệu encoder trục kéo giấy bất thường.',
    steps: ['Tắt máy. Lấy hết giấy và vật lạ trong đường giấy.', 'Bật lại máy.'],
    service: true,
    blink: 'Đèn Alarm và Power nháy luân phiên 3 lần',
  },
  '5700': {
    title: 'Lỗi cảm biến khay giấy',
    cause: 'Cảm biến cam của khay nạp giấy sau báo lỗi.',
    steps: ['Tắt máy. Kiểm tra khay sau không bị kẹt giấy hay vật lạ.', 'Bật lại máy.'],
    service: true,
    blink: 'Đèn Alarm và Power nháy luân phiên 5 lần',
  },
  '5400': {
    title: 'Nhiệt độ trong máy bất thường',
    cause: 'Máy quá nóng hoặc cảm biến nhiệt lỗi.',
    steps: ['Tắt máy, để nguội 15 đến 30 phút ở nơi thoáng.', 'Bật lại máy.'],
    service: true,
    blink: 'Đèn Alarm và Power nháy luân phiên 6 lần',
  },
  '5B00': {
    title: 'Bộ thấm mực đầy',
    cause: 'Miếng thấm mực thải đã đầy, máy từ chối in để tránh tràn mực.',
    steps: ['Không tự xử lý được bằng nút bấm thông thường.', 'Mang máy đến thợ để thay bộ thấm mực và reset bộ đếm bằng Canon Service Tool.'],
    service: true,
    blink: 'Đèn Alarm và Power nháy luân phiên 7 lần',
  },
  '5B01': {
    title: 'Bộ thấm mực đầy',
    cause: 'Miếng thấm mực thải đã đầy, máy từ chối in để tránh tràn mực.',
    steps: ['Không tự xử lý được bằng nút bấm thông thường.', 'Mang máy đến thợ để thay bộ thấm mực và reset bộ đếm bằng Canon Service Tool.'],
    service: true,
    blink: 'Đèn Alarm và Power nháy luân phiên 7 lần',
  },
  '5200': {
    title: 'Đầu phun quá nhiệt',
    cause: 'Nhiệt độ đầu phun vượt ngưỡng, thường do hộp mực hết hoặc hỏng.',
    steps: ['Tắt máy, để nguội vài phút.', 'Kiểm tra hộp mực còn mực. Tháo ra lắp lại.', 'Bật lại máy.'],
    service: true,
    blink: 'Đèn Alarm và Power nháy luân phiên 8 lần',
  },
  '6800': {
    title: 'Lỗi EEPROM',
    cause: 'Không đọc hoặc ghi được bộ nhớ của máy.',
    steps: ['Tắt máy, rút dây điện 1 phút, cắm lại rồi bật máy.'],
    service: true,
    blink: 'Đèn Alarm và Power nháy luân phiên 9 lần',
  },
  '6801': {
    title: 'Lỗi EEPROM',
    cause: 'Không đọc hoặc ghi được bộ nhớ của máy.',
    steps: ['Tắt máy, rút dây điện 1 phút, cắm lại rồi bật máy.'],
    service: true,
    blink: 'Đèn Alarm và Power nháy luân phiên 9 lần',
  },
  B200: {
    title: 'Lỗi điện áp đầu phun',
    cause: 'Điện áp đầu phun bất thường, thường do hộp mực hỏng hoặc chập.',
    steps: [
      'Tắt máy, rút dây điện.',
      'Tháo cả hai hộp mực, lau khô chân tiếp xúc, lắp lại từng hộp một để tìm hộp gây lỗi.',
      'Bật lại máy.',
    ],
    service: true,
    blink: 'Đèn Alarm và Power nháy luân phiên 10 lần',
  },
  '*': {
    title: 'Lỗi chưa có hướng dẫn',
    cause: 'Máy in báo một mã chưa có trong bảng.',
    steps: ['Tắt máy, bật lại rồi in lại.', 'Nếu vẫn lỗi, tra mã trên trang hỗ trợ Canon hoặc liên hệ bảo hành.'],
  },
};

const GUIDES: Record<Locale, Guides> = { en, vi };

// What is specific to a printer family. The codes and fixes above are Canon's
// common support codes (the same across the PIXMA range of that era); the lamp
// patterns come from the iP2700 service manual, so they are shown for that
// family only, and the cartridge names follow the model.
const CARTRIDGES: [RegExp, string][] = [
  [/iP27|MP2[3-8]|MP49|MX3[2-6]|MX4[12]/i, 'PG-510 / PG-512 (black), CL-511 / CL-513 (colour)'],
  [/MG2[45]|MG29|MG30|TS31|E47|E46/i, 'PG-545 / PG-545XL (black), CL-546 / CL-546XL (colour)'],
  [/iP28|E31|E40|E41/i, 'PG-445 / PG-445XL (black), CL-446 / CL-446XL (colour)'],
];
const UNKNOWN_CARTRIDGES: Record<Locale, string> = {
  en: 'see the printer\u2019s manual',
  vi: 'xem sách hướng dẫn của máy',
};
function cartridgesFor(model: string | undefined, locale: Locale): string {
  for (const [re, names] of CARTRIDGES) if (model && re.test(model)) return names;
  return UNKNOWN_CARTRIDGES[locale] || UNKNOWN_CARTRIDGES.en;
}
const BLINK_FAMILY = /iP27/i;

// DWS: warnings that do not stop printing
const WARNINGS: Record<Locale, Record<string, string>> = {
  en: {
    '1499': 'Ink is running low. Get a new cartridge ready; printing still works.',
    '1500': 'Ink is running low. Get a new cartridge ready; printing still works.',
    '1570': 'Out of ink. Replace the cartridge.',
    '1900': 'The print head is in its protected position. Close the cover.',
  },
  vi: {
    '1499': 'Mực sắp hết. Chuẩn bị hộp mực mới, vẫn in được.',
    '1500': 'Mực sắp hết. Chuẩn bị hộp mực mới, vẫn in được.',
    '1570': 'Mực đã cạn. Thay hộp mực.',
    '1900': 'Đầu phun đang ở chế độ bảo vệ. Đóng nắp máy.',
  },
};

// CTK: the state of a cartridge
const CARTRIDGE: Record<Locale, Record<string, string>> = {
  en: {
    SET: 'ok',
    SETZ: 'ink tracking off (refilled)',
    LOW: 'low',
    LLOW: 'very low',
    EMP: 'empty',
    IO: 'empty',
    NO: 'not installed',
    NS: 'not installed',
    UK: 'unknown',
    RUK: 'level unknown',
    MUL: 'duplicate type',
    REG: 'wrong region',
    HRD: 'hardware error',
    POS: 'wrong position',
  },
  vi: {
    SET: 'bình thường',
    SETZ: 'đã tắt dò mực (hộp bơm lại)',
    LOW: 'sắp hết',
    LLOW: 'gần cạn',
    EMP: 'hết mực',
    IO: 'hết mực',
    NO: 'chưa lắp',
    NS: 'chưa lắp',
    UK: 'không rõ',
    RUK: 'không rõ lượng mực',
    MUL: 'trùng loại',
    REG: 'sai vùng',
    HRD: 'lỗi phần cứng',
    POS: 'sai vị trí',
  },
};

// Other models report no code: map the IPP reasons the firmware derives to one
const REASON_CODES: Record<string, string> = {
  'media-empty-error': '1000',
  'media-jam-error': '1300',
  'cover-open-error': '1200',
  'marker-supply-empty-error': '1688',
};

export function codesFor(p: { codes?: string[]; reasons: string[] } | null): string[] {
  if (!p) return [];
  if (p.codes?.length) return p.codes;
  const out: string[] = [];
  for (const r of p.reasons) if (REASON_CODES[r] && !out.includes(REASON_CODES[r])) out.push(REASON_CODES[r]);
  return out;
}

// model: the printer's make and model (e.g. "Canon iP2700 series"); without
// it the guide is the common one, with no lamp pattern.
export function guideFor(code: string, locale: Locale = i18n.locale, model?: string): ErrorGuide {
  const table = GUIDES[locale] || en;
  const g = table[code] || en[code];
  if (!g) {
    const unknown = table['*'];
    return { ...unknown, cause: `${unknown.cause} (${code})`, service: /^[5-9A-F]/.test(code) };
  }
  const cartridges = cartridgesFor(model, locale);
  return {
    ...g,
    steps: g.steps.map((s) => s.replace('{cartridges}', cartridges)),
    blink: model && BLINK_FAMILY.test(model) ? g.blink : undefined,
  };
}

export function warningText(code: string, locale: Locale = i18n.locale): string {
  return WARNINGS[locale]?.[code] || WARNINGS.en[code] || '';
}

export function cartridgeState(state: string | undefined, locale: Locale = i18n.locale): string {
  if (!state) return '';
  const key = /^POS\d$/.test(state) ? 'POS' : state;
  return CARTRIDGE[locale]?.[key] || CARTRIDGE.en[key] || '';
}
