let XLSX     = require('xlsx')
let workbook = XLSX.readFile('shift.xlsx')

let shift_inf = [];

// 1000個の情報を生成して配列に追加
for (let i = 5; i >0; i--) {
  const job_type = `Job Type ${i}`;
  const user_name = `User ${i}`;
  const start_time = `${i}`;
  const end_time = `End Time ${i}`;
  const line_nunber = `Line Number ${i}`;
  const day_Monday = `Day Monday ${i}`;
  const working_time = `Working Time ${i}`;

  // 各列のデータをオブジェクトとして追加
  shift_inf.push({
    job_type,
    user_name,
    start_time,
    end_time,
    line_nunber,
    day_Monday,
    working_time
  });
}

shift_inf.sort((a,b)=>a.start_time - b.start_time);
// 最初の10個の情報を表示（確認用）
console.log(shift_inf);

 let sheet_name_list = workbook.SheetNames
let Sheet1          = workbook.Sheets[sheet_name_list[0]]  // シート1をデータを取得します
i = 8
let Sheet1A1        = Sheet1[`B${i}`].v
console.log( `シート1のセルA1の値：\n${Sheet1A1}` )


//console.log(Sheet1)
console.log('v',Sheet1['C111'].v)