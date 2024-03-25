import {
    Controller,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    // Req,
    UseInterceptors,
    UploadedFile,
    Put,
    Get,
    Request,
} from '@nestjs/common';
import { CreateManagerService } from './services/create-manager.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import {
    CreateListManagers,
    // CreateManagerDto,
    ManagerIdParamDto,
    UpdateManagerDTO,
} from '../api-manager/dto/manager.dto';
// import { Request } from 'express';
import { DeactivateManagerService } from './services/deactivate-manager.service';
import { ActivateManagerService } from './services/activate-manager.service';
import { CreateMeetDto, MeetIdParamDto } from '../api-manager/dto/meet.dto';
import { CreateMeetService } from './services/create-meet.service';
import { DeleteMeetService } from './services/delete-meet.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateManagersService } from './services/create-managers.service';
import { DeleteManagerService } from './services/delete-manager.service';
import { UpdateManagerService } from './services/update-manager.service';
import { FindMeetsService } from './services/findMeets.service';
import { UpdateImageService } from './services/update-image.service';

@UseGuards(RolesGuard)
@Controller('api-admin')
export class ApiAdminController {
    constructor(
        private readonly createManagerService: CreateManagerService,
        private readonly activateManagerService: ActivateManagerService,
        private readonly deactivateManagerService: DeactivateManagerService,
        private readonly createMeetService: CreateMeetService,
        private readonly deleteMeetService: DeleteMeetService,
        private readonly createListOfManagersService: CreateManagersService,
        private readonly deleteManagerService: DeleteManagerService,
        private readonly updateManagerService: UpdateManagerService,
        private readonly findMeetsService: FindMeetsService,
        private readonly updateImageService: UpdateImageService,
    ) {}

    // @Roles(['admin'])
    // @Post('manager/create')
    // createManager(
    //     @Body() createManagerDto: CreateManagerDto,
    //     @Req() req: Request,
    // ) {
    //     return this.createManagerService.execute(createManagerDto, req);
    // }

    @Roles(['admin'])
    @Post('manager/create-many')
    createListOfManagers(
        @Body() createManagerDto: CreateListManagers,
        @Request() req,
    ) {
        return this.createListOfManagersService.execute(
            createManagerDto,
            req.user.id,
        );
    }

    @Roles(['admin'])
    @Post('manager/:id/deactivate')
    deactivateManager(@Param() param: ManagerIdParamDto) {
        return this.deactivateManagerService.execute(param.id);
    }

    @Roles(['admin'])
    @Post('manager/:id/activate')
    activateManager(@Param() param: ManagerIdParamDto) {
        return this.activateManagerService.execute(param.id);
    }

    @Roles(['admin'])
    @Post('meet/create/:id')
    createMeet(
        @Param() param: ManagerIdParamDto,
        @Body() createMeetDto: CreateMeetDto,
    ) {
        return this.createMeetService.execute(param.id, createMeetDto);
    }

    @Roles(['admin'])
    @Delete('meet/:id/delete')
    remove(@Param() param: MeetIdParamDto) {
        return this.deleteMeetService.execute(param.id);
    }

    @Roles(['admin'])
    @Delete('manager/:id/delete')
    removeManager(@Param() param: ManagerIdParamDto) {
        return this.deleteManagerService.execute(param.id);
    }

    @Roles(['admin'])
    @Put('manager/:id/update')
    updateManager(
        @Param() param: ManagerIdParamDto,
        @Body() updateManager: UpdateManagerDTO,
    ) {
        return this.updateManagerService.execute(param.id, {
            ...updateManager,
        });
    }

    @Get('meet/')
    findMeets() {
        return this.findMeetsService.execute();
    }

    @Roles(['admin'])
    @Put('meet/:id/image')
    @UseInterceptors(FileInterceptor('image'))
    updateImageMeet(
        @Param() param: MeetIdParamDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.updateImageService.execute(file, param.id);
    }
}
