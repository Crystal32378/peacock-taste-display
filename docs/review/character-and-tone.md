# 角色與語氣 — 建議修改單（兔兔）

規則照小克定的：**不改 app 程式碼**。每一條都是「改哪個檔 / 改成什麼 / 為什麼 / 怎麼驗證」，小克逐條審完再合併。

本文不含 Qloo 回傳資料、不含 affinity 數字、不含任何 token。提到的 verdict 全部來自 repo 內既有的 fixture 測試基準（`tests/taste.test.mjs`），那是 repo 裡本來就有的東西。

---

## 立刻可改（只動字串）

### 提案 1｜`public/i18n.js` — friend.fold[4] 的 "its" 指涉不清

**現況**
```
EN  "There is taste here." / "Just not its taste. The peacock needs a moment to accept this."
ZH  "There is taste here." / "這裡有品味，只不是牠那一套。孔雀需要一分鐘接受。"
```

**問題**
這句的前半句 "here" 指的是**你**（你有品味），後半句 "its" 要轉成**孔雀**。讀者得在中途換一次主詞，而且 "its" 本身在英文裡很容易被讀成 "here" 的所有格。中文沒有這個問題——「牠」在中文裡只可能是那隻鳥。

這是上一輪才加進來的新句子，所以是這份清單裡最該先修的一條。

**改成**
```
EN  "There is taste here." / "Just not the peacock's kind. The peacock needs a moment to accept this."
```

**怎麼驗證**
`tests/character.test.mjs` 已有「中英標題同步」與「池長度一致」兩條測試；這句改完後 `npm test` 應仍全綠（兩個語言都要改，只改英文會被中英同步測試擋下）。

---

### 提案 2｜`public/i18n.js` — Lover 的 fold pool 沒有「你有品味」這一層

**現況**

Friend 的 fold pool 有五句，其中一句是 `There is taste here.`——在孔雀什麼都沒對上的時候，承認**對方是有品味的**。

Lover 的 fold pool 只有三句：
```
"Not tonight."            / "Nothing moved. The tail has folded. This is about feathers, not about you."
"Nothing to see here."    / "The peacock has read your {cat} list, and is keeping its thoughts to itself."
"The tail has opinions."  / "Folded. The peacock has standards and has declined to explain them."
```
三句都是「沒對上」，**沒有一句承認對方有品味**。

**問題**
Lover 是更容易讓人覺得被評的那個模式（孔雀在臉紅、在撒嬌），結果在完全沒有交集的時候，它反而一句「你有品味」都不給。Friend 給了、Lover 沒給，這個落差沒有理由。

**改成** — Lover 的 fold pool 加第四句，語氣要跟 Friend 那句對稱但更貼 Lover：
```
EN  "You do have taste."  / "The peacock simply prefers another kind. It is not taking this personally."
ZH  "你是有品味的。"       / "孔雀只是偏好另一種，不是對你有什麼意見。"
```

**怎麼驗證**
新增後 `COPY.en.lover.fold` 與 `COPY.zh.lover.fold` 長度必須都是 4（中英同步測試會擋下只改一邊的情況）。走一次連續收屏，確認 Lover 會說出這句。

---

### 提案 3｜`public/i18n.js` — 把 "Not at you. At the evening." 放回 eyeroll pool（改成三句）

**現況**
```
" I am being very patient." / "Several in a row now. The peacock rolls its eyes, mostly at its own very narrow taste."
"Truly."                   / "Another fold. The peacock studies the ceiling, which is at least consistent."
```

**問題**
上一輪因為「連續收屏時像在嫌人」，eyeroll 被改成孔雀自嘲（"mostly at its own very narrow taste"）。自嘲是安全了，但**孔雀的勢利是特色**，這次修改把它削掉一塊。

而且被換掉的那句其實一點都不嫌人：
> "The peacock rolls its eyes. **Not at you. At the evening.**"

它明確說「不是針對你」，矛頭指向的是「今晚」——那是一句很乾、很好笑、又完全踩在羽毛上的話。

**改成** — eyeroll pool 擴成三句，把舊句放回去，中英文都放：
```
EN  "Several in a row now. The peacock rolls its eyes. Not at you. At the evening."
ZH  "連續好幾位都沒動，孔雀翻了白眼。不是對你，是對今晚。"
```

**為什麼是三句而不是取代**
連敗時孔雀可以「對自己嚴格」（自嘲）也可以「對今晚嚴格」（舊句）。兩種都成立，輪替比只有一種耐看，而且都不會讓人被嫌。

**怎麼驗證**
連續收盤三次，確認三句都出現過、且 pool 內沒有重複句（中英 pool 各有「no pool repeats a line」測試）。

---

### 提案 4｜`public/i18n.js` — flicker pool 有兩句開頭撞字

**現況**
```
[0] "Only a flicker."     / "A little movement. The peacock declines to elaborate."
[3] "Hardly an ovation."  / "A little movement. The peacock has seen better evenings, and worse."
```
加上 Lover 的 `[0] "A flicker, and a sideways look." / "A little movement. The peacock glanced at you and said nothing."`
——九句 flicker 裡有三句以 **"A little movement."** 開頭。

**問題**
「不要宣稱畫面上沒發生的事」這個修正是對的（改成不數羽毛數量）。但改成全部都用同一句開頭，就變成另一種重複。

**改成** — 讓每一句用不同的開場，數量仍然不宣稱：
```
[0] "Only a flicker."     / "Something moved, briefly. The peacock declines to elaborate."
[3] "Hardly an ovation."  / "A stir, nothing more. The peacock has seen better evenings, and worse."
```
（中文兩句本來就不同： 「有一點動靜」/「算不上喝采」，只需要確認改完仍然對得上。）

**怎麼驗證**
跑一次完整十人走位，把出現過的 flicker 句抄下來，確認沒有兩句共用開頭。

---

### 提案 5｜`data/cast.js` — 讓 Mira 自己說出 Gilmore Girls

**現況**

Mira 的十項：Lost in Translation / **Gilmore Girls** / Brian Eno / Ways of Seeing / Blue Bottle Coffee / Copenhagen / Desert Island Discs / Gris / Jil Sander / Sofia Coppola
tag：`安靜極簡派`／`The quiet minimalist`
blurb：`安靜、觀察入微。一件好外套穿十年。`

**問題**
除了 Gilmore Girls，其他九項都是安靜的、觀察性的、極簡的。Gilmore Girls 是熱鬧、話多、連續十年的家庭喜劇。「安靜、觀察入微」的人會選它嗎？

**但是不要換掉它。**
它是整份卡司裡**唯一一個不學院派的品項**。上一輪換掉四個重複品項的時候，方向是對的——十個藝人曾經全是美學正典，現在有 Top Gear、Ghost World、Grasse、Leica、Gilmore Girls 混進來了。把 Gilmore Girls 拿掉，清單會整批退回「沒有爭議的品味正典」。

**改成** — 讓角色自己交代，這比換掉更誠實：
```
taste:    "環境音樂、藝術評論，一杯很好的咖啡，和一部很吵的影集。"
tasteEn:  "Ambient records, art criticism, one very good coffee, and one very loud television series."
```

**怎麼驗證**
走 Mira 那格，看 `tasteLine` 讀起來像不像同一個人講的話；再看十項清單，確認 Gilmore Girls 仍然在裡面。

---

### 提案 6｜`public/i18n.js` — 單一命中時，fav 那句和 hits 那句在講同一件事

**現況**
Jun 只有一個完全命中（Blue Bottle Coffee），畫面上會同時出現：
```
✦ The peacock is partial to the "place" feather: Blue Bottle Coffee
Where you meet: place Blue Bottle Coffee
```
**兩行是同一件事**，只是換了個格式。Oliver（只有一個 ≈ 命中）同理。

**問題**
這不是錯，是重複。孔雀在同一個氣口裡把同一句話講兩遍——對一個只用了一句話的戲份來說特別明顯。

**改成**（兩個方向，擇一）
- **A**：命中只有一項時，`#hits` 不顯示，讓 fav 那句獨自承載（fav 是孔雀的話，hits 是介面的話）
- **B**：fav 那句改成不重複品項，只講「孔雀偏心哪一根」，品項交給 hits

我傾向 A：fav 那句帶愛意，是孔雀的話；hits 是資料。命中一項時兩者本來就是同一件事。

**怎麼驗證**
走 Jun（1 命中）和 Mira（4–5 命中）兩格，確認只有一項時不重複、兩項以上時兩行都有意義。

---

## 需要 Qloo 驗證（動品項，會影響 verdict）

### 提案 7｜`data/cast.js` — Bei 的「舊書店」跟她的 place 對不上

**現況**
```
Bei  blurb : "畫畫、愛陶器，常在舊書店消失一下午。"
     blurbEn: "Paints, loves ceramics, vanishes into second-hand bookshops for an afternoon."
     place  : "Eslite Bookstore"
```

**問題**
誠品是連鎖書店。「常在**舊書店**消失一下午」跟誠品有一點對不上——而且誠品同時是 Su-yin 的 place（重複品項之一）。

**改成**（候選，需 Qloo 確認能 resolve 成 `place` 且不會變成 Blue Bottle Coffee 的鄰居）
```
place: "唐山書店" 或 "水準書局" 或 "茉莉二手書店"
```

**風險很低**：舊書店跟 Blue Bottle Coffee 不會是鄰居，Bei 的 place 原本就是 `none`，換掉之後仍是 `none`，verdict 不動。

**為什麼值得做**
這是清單裡少數「純粹打錯字」等級的不一致：blurb 明講舊書店，清單給了一間連鎖店。順便把重複品項清掉一個。

**怎麼驗證**
用 Qloo 查一次確認能 resolve；再走 Bei 那格，確認 `hits` 仍然是空、`#theirs` 顯示新店名、verdict 沒變。

---

## 我建議保留、不要動的（附理由）

1. **Jun 的 Blue Bottle Coffee** — 表面上是「耐心下廚派」配一間藍瓶咖啡有點怪，但 **Jun 唯一的完全命中就是它**，而 demo 裡需要一個「只有一項完全對上」的角色來展示「對上但不多」是什麼樣子。換掉會讓 Jun 變成另一個 fold。這個品項是有承重的，留著。

2. **Ren 的 Aphex Twin** — 它跟訪客的 Brian Eno 是全份清單裡最好的一組「≈」（兩個 ambient 電子音樂家）。Ren 靠它拿到兩個近似命中。改成真正的「遊戲原聲帶作曲家」會拿掉這個配對。

3. **Mira 的 Gilmore Girls** — 見提案 5，不是要換掉，是要讓她自己說出來。

4. **friend.yawn[0] 的 "in your direction" /「當著你的面」** — 這是唯一一句孔雀刻意在你面前做動作的話。它不構成「嫌你」，是傲慢的肢體語言（在你面前打哈欠），跟角色設定一致。不用改。

5. **friend.shiver[1] "I am not shaking. You are."** — 這是全組最成功的一句玩笑：把孔雀的生理反應推給對方。留著。

---

## 我實測的基準（供你參考，非 Qloo 回傳資料）

這些是**repo 既有 fixture 測試**已經斷言的東西（`tests/taste.test.mjs`），不是我另外抓的 live 資料：

| 角色 | fixture verdict | fixture 命中 |
|---|---|---|
| Mira | shiver | artist / book / brand / place |
| Lin | swoon | film / series / podcast / person |
| Ren | shiver | 只��近似命中，零完全命中 |
| Dax | flicker | 一根近似 |
| Theo | fold | 零命中 |

live 模式的分佈會隨 Qloo 結果浮動，但結構性的一點值得記著：**十個角色裡有四個落在 flicker**，孔雀有四成的時間在講「有一點動靜」。這是分布問題，不是句子問題——flicker 的 pool 已經擴到五句，再加句子效益不大。要改得動 verdict，而那需要 Qloo 驗證。

---

## 附：本 PR 附帶的測試

`tests/character.test.mjs`（15 條，`npm test` 會自動跑，全綠）

角色與語氣的不變量，全部在 fixture / 純字串層面，**不含 Qloo 回傳資料、不含 token、不連網**：

- 每個角色十根羽毛都填滿、每根一項、沒有 Qloo 類型以外的欄位
- 每個角色的 blurb / tag / taste 中英文都存在、tag 長度 ≤ 8
- 沒有任何角色把同一個品項放在兩種羽毛底下
- 出場順序就是我們 agreed 的 WALK 順序（要改必須是刻意的改動）
- 每個中英 pool 長度一致、中文標題就是英文標題（這條擋下過 they/them 那類漂移）
- 同一個 pool 裡沒有重複的句子
- **沒有任何一句宣稱「每根羽毛都動了」**（這是 lover 那句 "Every feather at once" 的那類錯誤，現在被測試擋住）
- 「nothing moved」只出現在 fold / yawn / eyeroll（三個只在收屏時出現的 pool）；「several feathers」只在 swoon
- 一個 pool 不會描述它自己 verdict 產不出來的狀態（fold pool 不能說「有一點動靜」，flicker pool 不能說「一根都沒動」）
- 台詞裡不出現任何「分數／百分比／相容度」的字眼
- `{cat}` 只在 fold pool 出現，而且只能落在 LIGHT 那六類（不 tease 別人的書、藝人、人物、遊戲）——LIGHT 集合是從 `public/app.js` 讀出來的，兩邊不同步就會紅
- **每一句英文台詞都有錄音**（51 個可達到的 line id 逐一檢查），這樣聲音不會在-session 中途掉回瀏覽器內建語音

> 這條錄音檢查是我第一輪量到「中文錄音 0/30、英文少兩支 `{cat}` 錄音」的後續。中文現在全部走瀏覽器語音是刻意的決定，所以這個測試只管英文。

---

## 附註：`public/audio/en/` 有八個錄音已經不會被用到

`en.friend.fold.1.{artist,book,person,video_game}` 與 `en.lover.fold.1.{artist,book,person,video_game}` 共八支——`LIGHT` 集合收窄成六類之後，這些品項永遠不會被請求到。檔案留著不影響執行，但可以考慮清掉（repo 小一點，也少一份「這個品項可以用來 tease 別人的書」的誤導）。
