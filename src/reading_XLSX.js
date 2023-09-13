
export function read(workbook, momentday) {

  const NumOfJob = 3;

  let sheet_name_list = workbook.SheetNames;
  let Sheet1 = workbook.Sheets[sheet_name_list[0]];
  let time_inf;//時間情報の配列
  let shift_inf = [];//ライン計算用配列
  let DAY_Monday;//月曜日の日付
  let line_number; //ラインの数
  let database = [];  //データベース送信用の配列

  let row = 7; //行
  let col = 2;  //列

  /**
   * 
   * Excelからデータを読み取り、shift_infに入れる
   * 
   *  */



  DAY_Monday = momentday;


  for (let i = 0; i < NumOfJob; i++) {

    let job_type = reading_data(row, col, Sheet1);
    row++;

    while (judge_data(row, col, Sheet1) == true) {
      let underspace = false;
      let flagoftime = 0;

      if (judge_data(row + 1, col, Sheet1) == false) underspace = true;

      let user_name = reading_data(row, col, Sheet1);

      for (col = 3; col < 10; col++) {

        time_inf = reading_time(row, col, Sheet1);
        if (time_inf != 0) {
          shift_inf.push({
            job_type,
            user_name,
            time_inf
          })
          time_inf = 0;
        }

        if (underspace == true) {
          if (judge_data(row + 1, col, Sheet1) == true) {
            time_inf = reading_time(row + 1, col, Sheet1);
          }
          if (time_inf != 0) {
            shift_inf.push({
              job_type,
              user_name,
              time_inf
            })
            flagoftime = 1;
            time_inf = 0;
          }
        }
      }
      col = 2;
      row++;
      if (flagoftime == 1) row++;
    }

    row++;


    shift_inf.sort((a, b) => a.time_inf.start_time - b.time_inf.start_time);
    var line = [0, 0, 0, 0, 0, 0];

    for (let k = 0; k < shift_inf.length; k++) {
      let line_n = 0;
      while (1) {

        let tempnum = 0;
        if (shift_inf[k].job_type == 'ホロプラスモデレーター') tempnum = 4;
        else if (shift_inf[k].job_type == 'ENモデレーター') tempnum = 6

        if (line[line_n] <= shift_inf[k].time_inf.start_time) {
          line[line_n] = shift_inf[k].time_inf.end_time;
          line_number = line_n + tempnum;

          database.push({
            job_type: shift_inf[k].job_type,
            user_name: shift_inf[k].user_name,
            start_time: shift_inf[k].time_inf.start_time,
            line_number: line_number,
            DAY_Monday: DAY_Monday,
            workingtime: shift_inf[k].time_inf.working_time
          })

          break;
        }
        line_n++
      }
    }
    shift_inf = [];
  }


  return database;
}

function indexToColumn(index) {
  let column = '';
  index--;
  while (index >= 0) {
    const remainder = index % 26;
    column = String.fromCharCode(65 + remainder) + column;
    index = Math.floor(index / 26) - 1;
  }
  return column;
}

function reading_data(row, col, Sheet1) {
  return Sheet1[`${indexToColumn(col)}${row}`].v;
}


function judge_data(row, col, Sheet1) {
  if (Sheet1[`${indexToColumn(col)}${row}`] === undefined) {
    return false;
  } else {
    return true;
  }
}


function reading_time(row, col, Sheet1) {
  let tmptime;
  let start_time;
  let end_time;
  let working_time;


  tmptime = reading_data(row, col, Sheet1);


  if (reading_data(row, col, Sheet1) == ' ') {
    return 0;
  } else if (reading_data(row, col, Sheet1) == '休み') {
    return 0;
  }


  tmptime = reading_data(row, col, Sheet1);
  start_time = parseInt(tmptime.split("〜")[0].split(":")[0]);
  end_time = parseInt(tmptime.split("〜")[1].split(":")[0]);


  start_time += 24 * (col - 3);
  end_time += 24 * (col - 3);
  working_time = end_time - start_time;


  return { start_time, end_time, working_time };

}

export default read;

