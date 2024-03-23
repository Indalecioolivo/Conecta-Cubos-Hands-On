import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { readFile } from 'node:fs/promises';
import { sign, verify } from 'jsonwebtoken';
import { CreateManagerDto } from 'src/modules/api-manager/dto/manager.dto';
import { PrismaService } from 'src/providers/prisma.service';
import { compile } from 'handlebars';
import { MailService } from 'src/providers/mailer.service';

@Injectable()
export class CreateManagersService {
    constructor(
        private prismaService: PrismaService,
        private readonly mailerService: MailService,
    ) {}

    async execute(createManagerDto: CreateManagerDto[], req: Request) {
        try {
            const { user: admin } = req.body;
            const managers: CreateManagerDto[] = req.body.managers;

            const createdManagers = [];

            for (let i = 0; i < managers.length; i++) {
                const managerExists =
                    await this.prismaService.manager.findFirst({
                        where: { email: managers[i].email },
                    });

                if (managerExists) {
                    return new HttpException(
                        'Manager already exists',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                const manager = await this.prismaService.manager.create({
                    data: {
                        ...managers[i],
                        admin_id: admin.id,
                    },
                });

                const token = sign(
                    { manager_id: manager.id },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: '30d',
                    },
                );

                const decodedToken = verify(token, process.env.JWT_SECRET);
                let token_expiration_time = new Date(0);

                if (typeof decodedToken !== 'string' && decodedToken.payload) {
                    token_expiration_time = new Date(
                        decodedToken.payload.exp * 1000,
                    );
                }

                const updatedManager = await this.prismaService.manager.update({
                    where: { id: manager.id },
                    data: {
                        token,
                        token_expiration_time,
                    },
                });

                const mailTemplate = (
                    await readFile(
                        './src/templates/send-manager-registration-data.hbs',
                    )
                ).toString();

                const subject = 'Parabéns, você agora pode organizar eventos!';

                const dynamicVariables = {
                    manager_name: updatedManager.name,
                    token: updatedManager.token,
                };

                const mail = compile(mailTemplate)(dynamicVariables);

                this.mailerService.sendMail(manager.email, subject, mail);

                createdManagers[i] = updatedManager;
            }

            return {
                managers: [...createdManagers],
            };
        } catch (error) {
            console.log(error);
            throw new HttpException(
                'Unexpected server error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
