import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
    const prisma = new PrismaClient();

    if (req.method === "POST") {
        // データベースにデータを追加するロジック
        try {
            let newItem;
            for (const item of req.body) {
                newItem = await prisma.shift_system.create({
                    data: {
                        job_type: item.job_type,
                        user_name: item.user_name,
                        start_time: item.start_time,
                        line_number: item.line_number,
                        DAY_Monday: item.DAY_Monday,
                        working_time: item.workingtime
                    },
                });
            }
            console.log('追加に成功しました');
            res.status(201).json(newItem);
        } catch (error) {
            res.status(500).json({ error: "データの追加に失敗しました。" });
        }
    } else if (req.method === "GET") {
        const { momentday } = req.query;
        // データベースからデータを取得する
        try {
            let database;

            if (momentday) {
                //日付での検索
                database = await prisma.shift_system.findMany({
                    where: {
                        DAY_Monday: new Date(momentday)
                    }
                });
            }
            else {
                //全データの取得
                database = await prisma.shift_system.findMany();
            }

            console.log('取得に成功しました');
            res.status(200).json(database);
        } catch (error) {
            res.status(500).json({ error: "データの取得に失敗しました。" });
        }
    } else if (req.method === "DELETE") {
        // データベースからデータを削除するロジック
        const { id } = req.body;
        try {
            await prisma.shift_system.delete({
                where: {
                    id,
                },
            });
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: "データの削除に失敗しました。" });
        }
    } else {
        res.status(405).end();
    }

    await prisma.$disconnect();
}
