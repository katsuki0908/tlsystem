import { cache, useEffect, useState } from 'react';
import { read } from '../reading_XLSX';
import Timeline, { CustomMarker, TimelineMarkers, TodayMarker } from 'react-calendar-timeline'
import moment from 'moment'
import 'moment/locale/ja';
import 'react-calendar-timeline/lib/Timeline.css'

export default function Home() {

  const today = Date.now()

  const groups = [{ id: 0, title: 'JP1' }, { id: 1, title: 'JP2' }, { id: 2, title: 'JP3' }, { id: 3, title: 'JP4' }, { id: 4, title: '  ホロプラス1' }, { id: 5, title: 'ホロプラス2' }, { id: 6, title: 'EN1' }, { id: 7, title: 'EN2' }, { id: 8, title: 'EN3' }]

  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);


  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 200) {
        setAuthenticated(true);
      } else {
        const data = await response.json();
        alert("user名またはパスワードが違います");
      }
    } catch (error) {
      console.error('認証リクエストエラー:', error);
      alert("サーバーに接続できませんでした\n時間を開けて再度更新してください");
    }
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  moment.locale('ja');

  const [shiftblock, setShiftblock] = useState([]);

  const Getdata = async () => {
    const items = [];

    try {
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
    } catch {
      alert("データの取得に失敗しました\n時間を開けて更新してください")
    }

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

        const queryString = new URLSearchParams({ momentday }).toString();
        const check = await fetch(
          `/api/server?${queryString}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
        );

        if (check.ok) {
          const datas = await check.json();
          if (datas && datas.length > 0) {
            alert("既にこの日付のデータは存在します")
          } else {
            let database = read(workbook, momentday);

            try {
              let num = 0;
              for (const item of database) {
                await fetch("/api/server", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(item),
                })
                num++;
              }
              alert("シフトの登録に成功しました");
              Getdata();
            } catch (error) { 
              console.log(num,"途中で終わったよ")
              console.log(error);
            }
          }
        } else {
          console.log("日付データの取得に失敗しました");
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
    <div>
      {!authenticated ? (
        <>
          <h1>Login Form</h1>

          <div className='form'>
            <input type="text" placeholder="ユーザー名" value={username}
              onChange={(e) => setUsername(e.target.value)} required />

            <input type="password" placeholder="パスワード" value={password}
              onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit" onClick={handleLogin}>ログイン</button>
          </div>

        </>
      ) : (
        <>
          {<>
            <div>
              <input type="file" onChange={handleFileUpload} />
              <button onClick={handleReadFile}>エクセルファイルを読み込む</button>
            </div>
            <div>
              <text>カレンダーの日付を押すと拡大縮小できます</text>
              <p />
              <text>直近3週間分のシフトが表示されます</text>
              <Timeline
                groups={groups}
                items={shiftblock}
                defaultTimeStart={moment().add(-12, 'hour')}
                defaultTimeEnd={moment().add(12, 'hour')}
                lineHeight={50}
                canChangeGroup={true}
              ><TodayMarker /></Timeline>
            </div></>}
        </>
      )}
    </div>

  );
}



