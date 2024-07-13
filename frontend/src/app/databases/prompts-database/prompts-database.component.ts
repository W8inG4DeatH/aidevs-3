import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PromptsDatabaseService } from 'src/app/databases/prompts-database/prompts-database.service';
import { IAiFile } from 'src/app/common-components/common-components.interfaces';

@Component({
    selector: 'prompts-database',
    templateUrl: './prompts-database.component.html',
    styleUrls: ['./prompts-database.component.scss'],
})
export class PromptsDatabaseComponent implements OnInit {
    @Output()
    selectPromptEmitter = new EventEmitter<IAiFile | null>();

    public projectDirectoryPath: string = 'e:/python/aiworks-prompts';
    files: IAiFile[] = [];
    selectedFile: IAiFile | null = null;
    editMode: boolean = false;

    constructor(private promptsDatabaseService: PromptsDatabaseService) {}

    ngOnInit(): void {
        this.loadFiles();
    }

    loadFiles(): void {
        this.promptsDatabaseService.readAllTxtFiles(this.projectDirectoryPath).subscribe({
            next: (files: any) => {
                this.files = files;
            },
            error: (error: any) => {
                console.error('Error loading files:', error);
            },
        });
    }

    onSelectFile(file: IAiFile): void {
        this.selectedFile = file;
        this.editMode = false;
        this.onUsePrompt();
    }

    updateFile(file: IAiFile): void {
        this.promptsDatabaseService.updateTxtFile(file, this.projectDirectoryPath).subscribe({
            next: () => {
                this.loadFiles();
            },
            error: (error: any) => {
                console.error('Error updating file:', error);
            },
        });
    }

    onDeleteSelectedFile(file: IAiFile): void {
        this.promptsDatabaseService.deleteTxtFile(file, this.projectDirectoryPath).subscribe({
            next: () => {
                this.loadFiles();
            },
            error: (error: any) => {
                console.error('Error deleting file:', error);
            },
        });
    }

    onEditFile() {
        this.editMode = true;
    }

    onSaveFile(): void {
        if (this.selectedFile) {
            this.updateFile(this.selectedFile);
            this.editMode = false;
        }
    }

    onUsePrompt(): void {
        this.selectPromptEmitter.emit(this.selectedFile);
    }
}
