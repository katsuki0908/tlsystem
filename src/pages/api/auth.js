// auth.js

import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcrypt';

const saltRounds = 5;
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;
        const bcrypt = require('bcrypt');
        let hashedPassword;
        try {

            const user = await prisma.user.findUnique({ where: { username } });

            if (!user) {
                return res.status(401).json({ message: 'ユーザーが見つかりません' });
            }
            const passwordMatch = await bcrypt.compare(password,user.password);
 
            if (!passwordMatch) {
                return res.status(401).json({ message: 'パスワードが一致しません' });
            }

            return res.status(200).json({ message: '認証成功' });

        } catch (error) {
            console.error('認証エラー:', error);
            return res.status(500).json({ message: '内部サーバーエラー' });
        }
    } else {
        return res.status(405).end();
    }
}
