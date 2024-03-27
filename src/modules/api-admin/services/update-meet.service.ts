import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { compile } from 'handlebars';
import { UpdateMeetDTO } from 'src/modules/api-manager/dto/meet.dto';
import { PrismaService } from 'src/providers/prisma.service';
import { MailService } from 'src/providers/mailer.service';

@Injectable()
export class UpdateMeetService {
    constructor(
        private prismaService: PrismaService,
        private mailerService: MailService,
    ) {}

    async execute(meetId: string, managerId: string, data: UpdateMeetDTO) {
        try {
            const meetExists = await this.prismaService.meet.findFirst({
                where: { id: meetId, manager_id: managerId },
            });

            if (!meetExists) {
                return new HttpException(
                    'Meet not found.',
                    HttpStatus.NOT_FOUND,
                );
            }

            const manager = await this.prismaService.manager.findFirst({
                where: { id: managerId },
            });

            if (!manager) {
                return new HttpException(
                    'Manager not found',
                    HttpStatus.BAD_REQUEST,
                );
            }

            const updatedMeet = await this.prismaService.meet.update({
                data: {
                    ...data,
                    start_time: new Date(data.start_time),
                    end_time: new Date(data.end_time),
                    datetime: new Date(data.datetime),
                },
                where: { id: meetExists.id },
            });

            const mailTemplate = (
                await readFile('./src/templates/send-manager-meet-data.hbs')
            ).toString();

            const subject = 'Evento Atualizado!';

            const dynamicVariables = {
                manager_name: manager.name,
                title: updatedMeet.title,
                token: manager.token,
                id: updatedMeet.id,
                datetime: updatedMeet.datetime,
            };

            const mail = compile(mailTemplate)(dynamicVariables);

            this.mailerService.sendMail(manager.email, subject, mail);

            return updatedMeet;
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
