# Mã lỗi Canon PIXMA iP2700 và cách khắc phục

Nguồn: Canon iP2700 / iP2770 / iP2780 Simplified Service Manual, QY8-13CR-000 Rev. 00, Canon Inc., tháng 1/2010, mục 1 "List of Error Display / Troubleshooting". Hướng dẫn dịch và diễn đạt lại bằng tiếng Việt, giữ nguyên các thao tác Canon chỉ định.

Máy iP2700 không có màn hình. Máy báo lỗi bằng đèn **Alarm** (cam) nháy N lần, hoặc đèn Alarm và đèn **Power** (xanh) nháy luân phiên N lần. Driver Windows hiển thị mã hỗ trợ 4 ký tự (support code). Trên web ESP32, mã này sẽ được suy ra từ trạng thái máy in gửi qua USB (xem mục 3).

Hai nút trên máy khi có lỗi:
- **ON**: tắt rồi bật lại máy.
- **RESUME/CANCEL** (nút tam giác trong vòng tròn): huỷ lệnh in đang lỗi và xoá lỗi.

## 1. Lỗi thao tác (đèn Alarm nháy cam)

Người dùng tự xử lý được. Sau khi xử lý, bấm RESUME/CANCEL để tiếp tục.

| Nháy | Mã | Lỗi | Nguyên nhân | Cách khắc phục |
| --- | --- | --- | --- | --- |
| 2 | 1000 | Hết giấy | Khay sau không có giấy hoặc giấy không kéo được | Nạp giấy vào khay sau, rồi bấm RESUME/CANCEL. |
| (không) | 1200 | Nắp máy đang mở | Nắp trên của máy chưa đóng | Đóng nắp trên của máy. Máy tự in tiếp. |
| 3 | 1300 | Kẹt giấy | Giấy kẹt trong máy | Kéo giấy kẹt ra chậm, kiểm tra không còn mẩu giấy vụn, rồi bấm RESUME/CANCEL. Máy in tiếp từ tờ kế tiếp. |
| 4 | 1687 | Hộp mực lắp chưa đúng | Hộp mực chưa cài khớp | Mở nắp máy, ấn chặt nắp khoá hộp mực xuống cho đến khi khớp, kiểm tra hộp mực đã nằm đúng, đóng nắp. Nếu vẫn lỗi, hộp mực có thể hỏng, thay hộp khác. |
| 5 | 1401 | Chưa lắp hộp mực | Máy không thấy hộp mực (màu hoặc đen) | Lắp hộp mực vào. Nếu vẫn lỗi, hộp mực có thể hỏng, thay hộp khác. |
| 5 | 1403 | Lỗi cảm biến nhiệt hộp mực | Chip hộp mực lỗi | Tháo ra lắp lại hộp mực. Nếu vẫn lỗi, thay hộp mực. |
| 5 | 1485 | Hộp mực không hỗ trợ | Hộp mực không đúng loại cho máy này | Lắp đúng loại PG-510/PG-512 (đen) và CL-511/CL-513 (màu). Nếu vẫn lỗi, thay hộp mực. |
| 7 | 1486 | Hộp mực sai vị trí | Đen và màu lắp ngược chỗ | Lắp lại đúng vị trí: đen bên trái, màu bên phải. Nếu đang in, huỷ lệnh in rồi lắp lại. |
| 7 | 1487 | Hai hộp mực cùng loại | Lắp hai hộp đen hoặc hai hộp màu | Thay một hộp bằng đúng loại còn thiếu. Mỗi loại chỉ dùng một hộp. |
| 8 | 1700 | Bộ thấm mực sắp đầy (cảnh báo) | Miếng thấm mực thải trong máy gần đầy | Bấm RESUME/CANCEL để in tiếp. Máy sẽ sớm cần mang đến trung tâm bảo hành thay bộ thấm mực và reset bộ đếm. Khi đầy hẳn máy sẽ ngừng in (lỗi 5B00). |
| 13 | 1686 | Không xác định được lượng mực | Hộp mực đã bơm lại hoặc đã hết, máy không đo được | Nên thay hộp mực mới. Để in tiếp mà không thay: giữ nút RESUME/CANCEL **ít nhất 5 giây**. Máy sẽ tắt dò mực cho hộp đó và ghi nhớ trong EEPROM; từ đó mức mực luôn hiện "không rõ". |
| 14 | 1684 | Hộp mực không nhận (sai vùng) | Hộp mực của thị trường khác (mã vùng khác máy) | Lắp hộp mực đúng vùng bán của máy. Nếu vẫn lỗi, thay hộp mực. |
| 15 | 1682 | Lỗi phần cứng hộp mực | Chip hộp mực không đọc được | Tháo ra, lau sạch chân tiếp xúc đồng, lắp lại. Nếu vẫn lỗi, thay hộp mực. |
| 16 | 1688 | Hết mực | Hộp mực (đen hoặc màu) đã cạn | Thay hộp mực mới rồi đóng nắp. Nếu đang in và muốn in cố: giữ nút RESUME/CANCEL **ít nhất 5 giây** với hộp mực vẫn lắp trong máy. Máy sẽ tắt dò mực; in khi hết mực có thể làm hỏng đầu phun. |

Ngoài bảng này, máy còn báo cảnh báo (không dừng in) và trạng thái bận:

| Tín hiệu | Ý nghĩa | Cách khắc phục |
| --- | --- | --- |
| DWS 1500 | Mực sắp hết (hộp đen hoặc màu) | Chuẩn bị hộp mực mới. Vẫn in được. |
| DWS 1900 | Đầu phun đang ở chế độ bảo vệ, kèm nắp mở | Đóng nắp máy. |
| HCF khác NO | Vừa thay hộp mực, chưa căn chỉnh đầu phun | In trang căn chỉnh đầu phun từ driver hoặc bỏ qua nếu bản in vẫn thẳng. |
| DBS WU / SL / CL / CC | Máy đang khởi động, ngủ, vệ sinh đầu phun, hoặc xe mực đang ở vị trí thay hộp | Chờ đèn Power sáng ổn định rồi in lại. |

## 2. Lỗi cần sửa chữa (đèn Alarm cam và Power xanh nháy luân phiên)

Người dùng chỉ làm được bước đầu. Nếu không hết, cần thợ hoặc trung tâm bảo hành Canon.

| Nháy luân phiên | Mã | Lỗi | Nguyên nhân | Người dùng thử trước | Nếu không hết |
| --- | --- | --- | --- | --- | --- |
| 2 | 5100 | Lỗi xe mực (carriage) | Tín hiệu encoder xe mực bất thường, thường do vật cản | Tắt máy. Mở nắp, lấy hết giấy kẹt, vật lạ, băng dính bảo vệ còn sót. Lau nhẹ dải phim trong suốt (timing slit film) chạy ngang phía sau xe mực bằng khăn khô không xơ. Bật lại máy. | Thay dải phim, cụm xe mực hoặc bo mạch. |
| 3 | 6000 | Lỗi kéo giấy (line feed) | Tín hiệu encoder trục kéo giấy bất thường | Tắt máy, lấy hết giấy và vật lạ trong đường giấy, bật lại. | Thay đĩa phim encoder hoặc bo mạch. |
| 5 | 5700 | Lỗi cảm biến cam ASF | Cảm biến khay nạp giấy sau lỗi | Tắt máy, kiểm tra khay sau không bị kẹt, bật lại. | Thay cụm cảm biến ASF/PE, bộ truyền động hoặc bo mạch. |
| 6 | 5400 | Nhiệt độ trong máy bất thường | Máy quá nóng hoặc cảm biến lỗi | Tắt máy, để nguội 15 đến 30 phút ở nơi thoáng, bật lại. | Thay bo mạch hoặc hộp mực. |
| 7 | 5B00 (Nhật: 5B01) | Bộ thấm mực đầy | Miếng thấm mực thải đã đầy, máy từ chối in | Không tự xử lý được bằng nút bấm thông thường. | Thay bộ thấm mực và reset bộ đếm bằng Service Tool ở chế độ service. |
| 8 | 5200 | Đầu phun quá nhiệt | Nhiệt độ đầu phun vượt ngưỡng, thường do hộp mực hết hoặc hỏng | Tắt máy, để nguội vài phút. Kiểm tra hộp mực còn mực, tháo ra lắp lại. Bật lại máy. | Thay hộp mực hoặc bo mạch. |
| 9 | 6800 / 6801 | Lỗi EEPROM | Không đọc hoặc ghi được bộ nhớ máy | Tắt máy, rút điện 1 phút, cắm lại, bật máy. | Thay bo mạch. |
| 10 | B200 | Lỗi điện áp đầu phun | Điện áp đầu phun bất thường, thường do hộp mực hỏng hoặc chập | Tắt máy, rút điện. Tháo cả hai hộp mực, lau khô chân tiếp xúc, lắp lại từng hộp để tìm hộp gây lỗi. | Thay hộp mực hoặc bo mạch. |

Cách vào chế độ service (chỉ dành cho thợ, theo mục 2-1 của tài liệu): tắt máy; giữ RESUME/CANCEL rồi giữ thêm ON; khi đèn Power sáng xanh, thả RESUME/CANCEL nhưng vẫn giữ ON; bấm RESUME/CANCEL 5 lần rồi thả cả hai nút. Sau đó dùng Canon Service Tool trên máy tính.

## 3. Ánh xạ từ trạng thái USB sang mã lỗi

Firmware ESP32 đọc trạng thái máy in qua IVEC `GetStatus`. Phần `<cijn:ReadData>` chứa chuỗi `TOKEN:GIÁ TRỊ;` của Canon (định dạng BSCC), và **máy gửi thẳng mã hỗ trợ 4 ký tự** trong đó. Đã kiểm chứng trên máy iP2700 thật ngày 2026-11-02:

```
rảnh:            idle (-)                 ... DOC:4,00,NO;DSC:NO;DWS:NO; ...
hết giấy:        stopped (MediaEmpty)     ... DOC:4,01,1000;DSC:NO; ...
mở nắp + hết giấy: stopped (DoorOpen)     ... DOC:4,01,1200,/,4,01,1000;DSC:NO; ...
đang in:         processing (-)           ... BST:80; ... DJS:PR/LD/EJ ...
```

Cách driver Linux chính thức của Canon (cnijfilter 3.40, bảng `mp240tbl.c` dùng chung cho iP2700, MP250/270/280, MP490/495, MX320-350) đọc các trường này:

| Trường | Ý nghĩa | Giá trị |
| --- | --- | --- |
| `DOC` | Lỗi thao tác = mã hỗ trợ. Nhiều lỗi cách nhau bằng `,/,`, mỗi nhóm 3 số, lấy số thứ 3 | `4,00,NO` không lỗi; `4,01,1000` hết giấy; `4,01,1200` nắp mở; 1300, 1401, 1403, 1485, 1486, 1487, 1682, 1684, 1686, 1687, 1688, 1700 như bảng mục 1 |
| `DSC` | Lỗi cần sửa chữa | `NO`; hoặc 5100, 5200, 5400, 5700, 5B00, 6000, 6800, 6801, B200 như bảng mục 2 |
| `DWS` | Cảnh báo | `NO`; 1500 mực sắp hết; 1900 bảo vệ đầu phun |
| `CTK` | Trạng thái từng hộp mực `CL,<state>,/,BK,<state>` | `SET` bình thường; `SETZ` đã tắt dò mực; `LOW` sắp hết; `EMP`/`IO` hết; `NO`/`NS` chưa lắp; `POS1-6` sai vị trí; `MUL` trùng loại; `REG` sai vùng; `HRD` lỗi phần cứng; `RUK` không rõ lượng |
| `CIR` | Mức mực `CL=<n>,BK=<n>` | 100, 070, 040, 010, 000 hoặc `UK` không rõ |
| `BST` | Bit trạng thái (hex) | 0x80 đang in; 0x20 bận; 0x08 có lỗi thao tác |
| `DBS` | Lý do bận | `WU` khởi động; `SL` ngủ; `CL` vệ sinh; `CC` xe mực ở vị trí thay; `TP` in test |
| `DJS` | Trạng thái lệnh in | `PR` in; `LD` nạp giấy; `EJ` đẩy giấy; `ID` rảnh; `CC`/`SC` đang huỷ |
| `HCF` | Chưa căn chỉnh đầu phun sau khi thay hộp | `NO`, `BK`, `CL`, `AL` |
| `<ivec:status_detail>` | Chỉ dùng dự phòng | `MediaEmpty`, `MediaJam`, `DoorOpen`, `MarkerSupplyAttention`, `DeviceBusy`, `AttentionRequired` |

Thứ tự ưu tiên khi hiển thị cửa sổ lỗi trên web:
1. `DSC` khác `NO`: lỗi cần sửa chữa, hiện mã và hướng dẫn mục 2.
2. `DOC` có mã: hiện từng mã với hướng dẫn mục 1 (có thể nhiều mã cùng lúc, ví dụ 1200 và 1000).
3. `CTK` có `LOW`, `EMP`, `IO`, `NO`, `POS`, `MUL`, `REG`, `HRD`: cảnh báo hộp mực tương ứng.
4. `DWS` 1500: cảnh báo mực sắp hết, không chặn.

Nguồn ánh xạ: cnijfilter-common (lgmon-3.40/src/mp240tbl.c, cngpijmon-3.40/src/bjcupsmon_data.h), cups-bjnp (bjnp-io.h, bjnp-levels.c), và log thực tế của máy.
