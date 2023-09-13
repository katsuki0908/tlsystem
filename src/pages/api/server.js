import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
    const prisma = new PrismaClient();

    if (req.method === "POST") {
        try {
            let newItem;
            let item = req.body
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
            res.status(201).json(newItem);
        } catch (error) {
            res.status(500).json({ error: "データの追加に失敗しました。" });
        }
    } else if (req.method === "GET") {
        const { momentday } = req.query;
        try {
            let database;

            if (momentday) {
                database = await prisma.shift_system.findMany({
                    where: {
                        DAY_Monday: new Date(momentday)
                    }
                });
            }
            else {
                database = await prisma.shift_system.findMany({
                    where: {
                        DAY_Monday: {
                            in: await prisma.shift_system.findMany({
                                select: {
                                    DAY_Monday: true,
                                },
                                distinct: ['DAY_Monday'],
                                orderBy: {
                                    DAY_Monday: 'desc',
                                },
                                take: 3,
                            }).then((data) => data.map((item) => item.DAY_Monday)),
                        },
                    },
                });

            }

            console.log('取得に成功しました');
            res.status(200).json(database);
        } catch (error) {
            res.status(500).json({ error: "データの取得に失敗しました。" });
        }
    } else if (req.method === "DELETE") {
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
