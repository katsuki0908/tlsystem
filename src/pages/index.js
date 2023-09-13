import { useEffect, useState } from 'react';
import { read } from '../reading_XLSX';
import Timeline, { CustomMarker, TimelineMarkers, TodayMarker } from 'react-calendar-timeline'
import moment from 'moment'
import 'moment/locale/ja';
import 'react-calendar-timeline/lib/Timeline.css'




export default function Home() {

  const today = Date.now()

  const groups = [{ id: 0, title: 'JP1' }, { id: 1, title: 'JP2' }, { id: 2, title: 'JP3' }, { id: 3, title: 'JP4' }, { id: 4, title: '  ホロプラス1' }, { id: 5, title: 'ホロプラス2' }, { id: 6, title: 'EN1' }, { id: 7, title: 'EN2' }, { id: 8, title: 'EN3' }]

  const [file, setFile] = useState(null);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // function MyComponent() {
  //   useEffect(() => {
  //     // ロケールを日本語に設定
  //     moment.locale('ja');

  //     // その他の設定変更もここで行うことができます

  //   }, []); // 空の依存配列を指定してマウント時に一度だけ実行
  // }

  // const calendarFormats = {
  //   dayFormat: (date, culture, localizer) =>
  //     localizer.format(date, 'dddd, MMMM DD, YYYY', culture),
  //   monthHeaderFormat: (date, culture, localizer) =>
  //     localizer.format(date, 'MMMM YYYY', culture),
  //   dayHeaderFormat: (date, culture, localizer) =>
  //     localizer.format(date, 'dddd, MMMM DD', culture),
  // };

  moment.locale('ja');

  const [shiftblock, setShiftblock] = useState([]);

  const Getdata = async () => {
    const items = [];
    //@@トライキャッチで確認
    const response = await fetch("/api/server", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })

    let database = await response.json();

    let index = 1;
    for (var item of database) {
      let tmptime = new Date(item.DAY_Monday);

      items.push(
        {
          id: index,
          group: item.line_number,
          title: item.user_name,
          start_time: tmptime.setHours(tmptime.getHours() + item.start_time),
          end_time: tmptime.setHours(tmptime.getHours() + item.working_time)
        }
      )
      index++;
    }
    setShiftblock(items);

  };

  const handleReadFile = async () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {

        const DAY_Monday = file.name.split("_")[1].split("-")[0];
        const year = DAY_Monday.substr(0, 4);
        const month = DAY_Monday.substr(4, 2) - 1;

        const day = DAY_Monday.substr(6, 2);
        const momentday = new Date(year, month, day);

        let XLSX = require('xlsx');
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        //momentdayの日付で検索する
        const queryString = new URLSearchParams({momentday}).toString();
        const check = await fetch(
          `/api/server?${queryString}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        //既にデータが入っているなら何もしない
        if(check.ok){
          const datas = await check.json();
          if (datas && datas.length > 0) {
            // データが存在する場合の処理
            alert("既にこの日付のデータは存在します")
          } else {
            // データが存在しない場合の処理
            let database = read(workbook, momentday);

            const response = await fetch("/api/server", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(database),
            })
            alert("シフトの登録に成功しました")
            Getdata();
          }
        }else{
          console.log("日付データの取得に失敗しました")
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  useEffect(() => {
    Getdata()
  },
    [])

  return (
    <>
      <div>
        <input type="file" onChange={handleFileUpload} />
        <button onClick={handleReadFile}>エクセルファイルを読み込む</button>
      </div>
      <button onClick={() => Getdata()}> 更新</button>
      <div>
        赤いカレンダーを押すと縮小・日付を押すと拡大
        <Timeline
          groups={groups}
          items={shiftblock}
          defaultTimeStart={moment().add(-12, 'hour')}
          defaultTimeEnd={moment().add(12, 'hour')}
          lineHeight={50}
          canChangeGroup={true}
        ><TodayMarker /></Timeline>
      </div></>
  );
}



