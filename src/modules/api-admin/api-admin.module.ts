import { Module } from '@nestjs/common';
import { CreateManagerService } from './services/create-manager.service';
import { ApiAdminController } from './api-admin.controller';
import { PrismaService } from 'src/providers/prisma.service';
import { DeactivateManagerService } from './services/deactivate-manager.service';
import { ActivateManagerService } from './services/activate-manager.service';
import { CreateMeetService } from './services/create-meet.service';
import { MailService } from 'src/providers/mailer.service';
import { DeleteMeetService } from './services/delete-meet.service';
import { StorageService } from 'src/providers/storage.service';
import { CreateManagersService } from './services/create-managers.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { DeleteManagerService } from './services/delete-manager.service';
import { UpdateManagerService } from './services/update-manager.service';
import { FindMeetsService } from './services/findMeets.service';
import { UpdateImageService } from './services/update-image.service';

@Module({
    controllers: [ApiAdminController],
    providers: [
        PrismaService,
        MailService,
        CreateManagerService,
        CreateManagersService,
        ActivateManagerService,
        DeactivateManagerService,
        CreateMeetService,
        DeleteMeetService,
        StorageService,
        DeleteManagerService,
        UpdateManagerService,
        FindMeetsService,
        UpdateImageService,
    ],
    imports: [
        MailerModule.forRoot({
            transport: {
                host: process.env.MAILER_HOST,
                secure: false,
                port: Number(process.env.MAILER_PORT),
                auth: {
                    user: process.env.MAILER_USER,
                    pass: process.env.MAILER_PASS,
                },
            },
            defaults: {
                from: process.env.MAILER_FROM,
            },
        }),
    ],
})
export class ApiAdminModule {}
