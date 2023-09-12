import { PrismaClient } from '@prisma/client'

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


  //月曜日の読み取り
  DAY_Monday = momentday;

  //同じ業務内の計算
  for (let i = 0; i < NumOfJob; i++) {

    let job_type = reading_data(row, col, Sheet1);
    row++;//最初の名前にセット

    while (judge_data(row, col, Sheet1) == true) {
      let underspace = false;//名前の下が空白ならtrue
      let flagoftime = 0;//シフトが２行なら１

      if (judge_data(row + 1, col, Sheet1) == false) underspace = true;
      //一人分の計算
      let user_name = reading_data(row, col, Sheet1);

      for (col = 3; col < 10; col++) {
        //時間の読み取り
        time_inf = reading_time(row, col, Sheet1);
        if (time_inf != 0) {
          shift_inf.push({
            job_type,
            user_name,
            time_inf
          })
          time_inf = 0;
        }

        //underspaceがtrueかつ
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

      //次の人へ
      col = 2;
      row++;
      if (flagoftime == 1) row++;
    }
    //次の業務へ
    row++;

    //タイムラインの計算

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
    //初期化
    shift_inf = [];
    //console.log(database);
  }



  //(未実装)データベースへの登録
  // for (const data of database) {
  //   prisma.shift_system.create({
  //     data: {
  //       id: 1,
  //       job_type: database.job_type,
  //       user_name: database.user_name,
  //       start_time: database.start_time,
  //       line_number: database.line_number,
  //       DAY_Monday: database.DAY_Monday,
  //       workingtime: database.workingtime,
  //     },
  //   });
  // }

  // const prisma = new PrismaClient()
  // const testdatabase = {
  //   job_type: 'JPモデレーター',
  //   user_name: 'test',
  //   start_time: 12345, // 適切な値を設定
  //   line_number: 1, // 適切な値を設定
  //   DAY_Monday: '09/06',
  //   working_time: 4, // 適切な値を設定
  // }
  // const shiftSystem =  prisma.shift_system.create({
  //   data: database,
  // })
  //console.log(database);
  return database;
}


//列番号をアルファベットに変換
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

//データの読み取り（中身が確実に入っているとき）
function reading_data(row, col, Sheet1) {
  //console.log(Sheet1[`${indexToColumn(col)}${row}`].v);
  return Sheet1[`${indexToColumn(col)}${row}`].v;
}

//データの判定
function judge_data(row, col, Sheet1) {
  if (Sheet1[`${indexToColumn(col)}${row}`] === undefined) {
    return false;
  } else {
    return true;
  }
}

//時間の読み取り
function reading_time(row, col, Sheet1) {
  let tmptime;
  let start_time;
  let end_time;
  let working_time;

  //中身の未処理データを読み込む
  tmptime = reading_data(row, col, Sheet1);

  //空白or休みなら何もしない
  if (reading_data(row, col, Sheet1) == ' ') {
    return 0;
  } else if (reading_data(row, col, Sheet1) == '休み') {
    return 0;
  }

  //時間を切り抜く
  tmptime = reading_data(row, col, Sheet1);
  start_time = parseInt(tmptime.split("〜")[0].split(":")[0]);
  end_time = parseInt(tmptime.split("〜")[1].split(":")[0]);

  //開始・終了・継続時間を求める
  start_time += 24 * (col - 3);
  end_time += 24 * (col - 3);
  working_time = end_time - start_time;

  //データを返す
  return { start_time, end_time, working_time };

}

export default read;

