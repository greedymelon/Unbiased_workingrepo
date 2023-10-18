import { Body, Controller, Get, Param, Post, UseInterceptors, UploadedFile, Patch, Query } from '@nestjs/common';
import { Appl, ApplStatus } from './appl.model';
import { ApplyService } from './apply.service';
import { CreateApplDto } from './dto/create-appl.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetApplyFilterDto } from './dto/get-apply-filter.dto';
import { UpdateApplyStatusDto } from './dto/update-appl-status.dto';
import { NotFoundException } from '@nestjs/common/exceptions'
import { MailService } from 'src/mailsending';


@Controller('apply')
export class ApplyController {
    constructor(private applyService:ApplyService) {}

    @Get()
    getAllApply(): Appl[] {
        return this.applyService.getAllApply();
    }
 @Post('/:encr')
    @UseInterceptors(FileInterceptor('cv'))
    createAppl( 
        @Body() createApplDto: CreateApplDto, 
        @UploadedFile() cv: Express.Multer.File,
        @Param('encr') encr: string
        ): Appl {
        createApplDto.cv = cv;
        let appl : Appl = this.applyService.createAppl(createApplDto);
        let token = this.applyService.tokenizerPdf(cv);
        if (!token) {
            throw new NotFoundException();
        }
        let redact = this.applyService.redactPdf(token, appl.name);
        if (!redact) {
            throw new NotFoundException();
        }

        let send : MailService;
        let email  = Buffer.from(encr, 'base64').toString('ascii');
        send.sendUserConfirmation(email.substring(email.lastIndexOf("_")), redact);
        return appl;
    }

    
    @Post()
    createAppl( @Body() body) {
        console.log('body', body);  
    }
}

