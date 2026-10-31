-- Seed: 30 soal matematika — Aljabar Dasar
-- subject: 'math', topic: 'algebra'
-- Types: mcq or numeric
-- Difficulty 1–5

insert into questions (subject, topic, difficulty, type, body, options, answer, explanation, time_limit_sec) values

-- ─── DIFFICULTY 1 (6 soal) ───────────────────────────────────────────────────
('math','algebra',1,'mcq',
 'Berapakah nilai $x$ jika $x + 5 = 10$?',
 '[{"id":"a","text":"3"},{"id":"b","text":"5"},{"id":"c","text":"7"},{"id":"d","text":"10"}]',
 'b','$x + 5 = 10 \Rightarrow x = 10 - 5 = 5$',30),

('math','algebra',1,'mcq',
 'Berapakah nilai $y$ jika $2y = 14$?',
 '[{"id":"a","text":"6"},{"id":"b","text":"7"},{"id":"c","text":"8"},{"id":"d","text":"12"}]',
 'b','$2y = 14 \Rightarrow y = 14 \div 2 = 7$',30),

('math','algebra',1,'numeric',
 'Jika $a = 3$ dan $b = 4$, berapakah nilai $a + b$?',
 null,'7',
 '$a + b = 3 + 4 = 7$',30),

('math','algebra',1,'mcq',
 'Sederhanakan: $3x + 2x$',
 '[{"id":"a","text":"5"},{"id":"b","text":"5x"},{"id":"c","text":"6x"},{"id":"d","text":"3x^2"}]',
 'b','Suku sejenis dijumlahkan: $3x + 2x = (3+2)x = 5x$',30),

('math','algebra',1,'numeric',
 'Berapakah nilai $n$ jika $n - 8 = 4$?',
 null,'12',
 '$n - 8 = 4 \Rightarrow n = 4 + 8 = 12$',30),

('math','algebra',1,'mcq',
 'Manakah yang merupakan contoh ekspresi aljabar?',
 '[{"id":"a","text":"15"},{"id":"b","text":"2 + 3 = 5"},{"id":"c","text":"4x + 1"},{"id":"d","text":"7 × 2"}]',
 'c','Ekspresi aljabar memuat variabel, contohnya $4x + 1$ mengandung variabel $x$.',30),

-- ─── DIFFICULTY 2 (6 soal) ───────────────────────────────────────────────────
('math','algebra',2,'mcq',
 'Selesaikan: $3x - 7 = 8$',
 '[{"id":"a","text":"4"},{"id":"b","text":"5"},{"id":"c","text":"6"},{"id":"d","text":"7"}]',
 'b','$3x = 8 + 7 = 15 \Rightarrow x = 15 \div 3 = 5$',30),

('math','algebra',2,'numeric',
 'Jika $2m + 3 = 11$, berapakah nilai $m$?',
 null,'4',
 '$2m = 11 - 3 = 8 \Rightarrow m = 8 \div 2 = 4$',30),

('math','algebra',2,'mcq',
 'Sederhanakan: $6x^2 - 2x^2 + x$',
 '[{"id":"a","text":"4x^2 + x"},{"id":"b","text":"5x^2"},{"id":"c","text":"4x^3"},{"id":"d","text":"5x^2 + x"}]',
 'a','$6x^2 - 2x^2 = 4x^2$, sehingga hasilnya $4x^2 + x$',30),

('math','algebra',2,'numeric',
 'Berapakah nilai $k$ jika $\frac{k}{4} = 7$?',
 null,'28',
 '$k = 7 \times 4 = 28$',30),

('math','algebra',2,'mcq',
 'Manakah persamaan yang benar untuk "dua kali suatu bilangan dikurangi 3 sama dengan 9"?',
 '[{"id":"a","text":"2n + 3 = 9"},{"id":"b","text":"2n - 3 = 9"},{"id":"c","text":"n - 3 = 9"},{"id":"d","text":"3n - 2 = 9"}]',
 'b','"Dua kali suatu bilangan" = $2n$, "dikurangi 3" = $-3$, "sama dengan 9" = $= 9$, jadi $2n - 3 = 9$.',30),

('math','algebra',2,'mcq',
 'Jika $p + q = 10$ dan $p = 4$, berapakah $q$?',
 '[{"id":"a","text":"4"},{"id":"b","text":"5"},{"id":"c","text":"6"},{"id":"d","text":"14"}]',
 'c','$q = 10 - p = 10 - 4 = 6$',30),

-- ─── DIFFICULTY 3 (6 soal) ───────────────────────────────────────────────────
('math','algebra',3,'mcq',
 'Selesaikan sistem persamaan: $x + y = 7$ dan $x - y = 3$. Berapakah $x$?',
 '[{"id":"a","text":"4"},{"id":"b","text":"5"},{"id":"c","text":"6"},{"id":"d","text":"7"}]',
 'b','Jumlahkan kedua persamaan: $2x = 10 \Rightarrow x = 5$. Substitusi: $y = 7 - 5 = 2$.',30),

('math','algebra',3,'numeric',
 'Jika $3(x - 2) = 12$, berapakah nilai $x$?',
 null,'6',
 '$3x - 6 = 12 \Rightarrow 3x = 18 \Rightarrow x = 6$',30),

('math','algebra',3,'mcq',
 'Faktorkan: $x^2 - 9$',
 '[{"id":"a","text":"(x-3)(x+3)"},{"id":"b","text":"(x-3)^2"},{"id":"c","text":"(x+9)(x-1)"},{"id":"d","text":"(x-3)(x-3)"}]',
 'a','Pola beda dua kuadrat: $a^2 - b^2 = (a-b)(a+b)$. Di sini $a=x, b=3$, jadi $(x-3)(x+3)$.',30),

('math','algebra',3,'numeric',
 'Berapakah hasil dari $(2x + 3)(x - 1)$ untuk $x = 2$?',
 null,'7',
 '$(2(2)+3)(2-1) = 7 \times 1 = 7$',30),

('math','algebra',3,'mcq',
 'Tentukan nilai $x$ dari $\frac{2x+1}{3} = 5$',
 '[{"id":"a","text":"6"},{"id":"b","text":"7"},{"id":"c","text":"8"},{"id":"d","text":"9"}]',
 'b','$2x + 1 = 15 \Rightarrow 2x = 14 \Rightarrow x = 7$',30),

('math','algebra',3,'mcq',
 'Jika $f(x) = 2x^2 - 3x + 1$, berapakah $f(2)$?',
 '[{"id":"a","text":"1"},{"id":"b","text":"3"},{"id":"c","text":"5"},{"id":"d","text":"7"}]',
 'b','$f(2) = 2(4) - 3(2) + 1 = 8 - 6 + 1 = 3$',30),

-- ─── DIFFICULTY 4 (6 soal) ───────────────────────────────────────────────────
('math','algebra',4,'mcq',
 'Selesaikan: $x^2 - 5x + 6 = 0$',
 '[{"id":"a","text":"x = 1 atau x = 6"},{"id":"b","text":"x = 2 atau x = 3"},{"id":"c","text":"x = -2 atau x = -3"},{"id":"d","text":"x = 2 atau x = -3"}]',
 'b','Faktorkan: $(x-2)(x-3) = 0$, maka $x = 2$ atau $x = 3$.',30),

('math','algebra',4,'numeric',
 'Jika akar-akar persamaan $x^2 - px + 12 = 0$ adalah 3 dan 4, berapakah nilai $p$?',
 null,'7',
 'Menurut teorema Vieta: jumlah akar $= p = 3 + 4 = 7$. Hasil kali akar $= 12 = 3 \times 4$.',30),

('math','algebra',4,'mcq',
 'Tentukan nilai $x$ dari $|2x - 4| = 6$',
 '[{"id":"a","text":"x = 5 atau x = -1"},{"id":"b","text":"x = 5 saja"},{"id":"c","text":"x = -1 saja"},{"id":"d","text":"x = 1 atau x = 5"}]',
 'a','$2x - 4 = 6 \Rightarrow x = 5$, atau $2x - 4 = -6 \Rightarrow x = -1$.',30),

('math','algebra',4,'mcq',
 'Sederhanakan: $\frac{x^2 - 4}{x + 2}$ untuk $x \neq -2$',
 '[{"id":"a","text":"x - 2"},{"id":"b","text":"x + 2"},{"id":"c","text":"x^2 - 2"},{"id":"d","text":"\\frac{x-2}{x+2}"}]',
 'a','$x^2 - 4 = (x-2)(x+2)$. Setelah dibagi $(x+2)$: $\frac{(x-2)(x+2)}{x+2} = x - 2$.',30),

('math','algebra',4,'numeric',
 'Jika $\log_2 x = 5$, berapakah nilai $x$?',
 null,'32',
 '$\log_2 x = 5 \Rightarrow x = 2^5 = 32$',30),

('math','algebra',4,'mcq',
 'Tentukan himpunan penyelesaian dari $2x - 3 > 7$',
 '[{"id":"a","text":"x > 5"},{"id":"b","text":"x > 2"},{"id":"c","text":"x < 5"},{"id":"d","text":"x > 10"}]',
 'a','$2x > 7 + 3 = 10 \Rightarrow x > 5$',30),

-- ─── DIFFICULTY 5 (6 soal) ───────────────────────────────────────────────────
('math','algebra',5,'mcq',
 'Jika $\alpha$ dan $\beta$ adalah akar-akar dari $2x^2 - 5x + 3 = 0$, berapakah $\alpha^2 + \beta^2$?',
 '[{"id":"a","text":"\\frac{13}{4}"},{"id":"b","text":"\\frac{25}{4}"},{"id":"c","text":"\\frac{1}{4}"},{"id":"d","text":"\\frac{19}{4}"}]',
 'a','$\alpha + \beta = \frac{5}{2}$, $\alpha\beta = \frac{3}{2}$. $\alpha^2 + \beta^2 = (\alpha+\beta)^2 - 2\alpha\beta = \frac{25}{4} - 3 = \frac{13}{4}$',30),

('math','algebra',5,'numeric',
 'Berapakah nilai minimum dari $f(x) = x^2 - 6x + 10$?',
 null,'1',
 'Nilai minimum di $x = -\frac{b}{2a} = 3$. $f(3) = 9 - 18 + 10 = 1$.',30),

('math','algebra',5,'mcq',
 'Tentukan nilai $x$ dari $4^x = 32$',
 '[{"id":"a","text":"\\frac{5}{2}"},{"id":"b","text":"2"},{"id":"c","text":"3"},{"id":"d","text":"\\frac{3}{2}"}]',
 'a','$4^x = 2^{2x}$ dan $32 = 2^5$, jadi $2x = 5 \Rightarrow x = \frac{5}{2}$.',30),

('math','algebra',5,'mcq',
 'Jika $\log 2 = 0{,}301$ dan $\log 3 = 0{,}477$, berapakah $\log 72$?',
 '[{"id":"a","text":"1,857"},{"id":"b","text":"1,778"},{"id":"c","text":"2,107"},{"id":"d","text":"1,602"}]',
 'a','$72 = 8 \times 9 = 2^3 \times 3^2$. $\log 72 = 3\log 2 + 2\log 3 = 3(0{,}301) + 2(0{,}477) = 0{,}903 + 0{,}954 = 1{,}857$',30),

('math','algebra',5,'numeric',
 'Jika $x + \frac{1}{x} = 3$, berapakah $x^2 + \frac{1}{x^2}$?',
 null,'7',
 '$(x + \frac{1}{x})^2 = x^2 + 2 + \frac{1}{x^2} = 9 \Rightarrow x^2 + \frac{1}{x^2} = 9 - 2 = 7$',30),

('math','algebra',5,'mcq',
 'Tentukan nilai $k$ agar $x^2 - kx + 9 = 0$ memiliki akar kembar',
 '[{"id":"a","text":"3"},{"id":"b","text":"6"},{"id":"c","text":"9"},{"id":"d","text":"±6"}]',
 'd','Akar kembar jika diskriminan $= 0$: $k^2 - 36 = 0 \Rightarrow k = \pm 6$.',30);
