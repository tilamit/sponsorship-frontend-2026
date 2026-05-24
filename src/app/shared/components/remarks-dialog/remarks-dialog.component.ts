import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface RemarksDialogData {
  title: string;
  label: string;
}

@Component({
  selector: 'app-remarks-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full">
        <mat-label>{{ data.label }}</mat-label>
        <textarea matInput rows="4" [(ngModel)]="remarks" maxlength="1000"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(undefined)">Cancel</button>
      <button mat-flat-button color="primary" (click)="ref.close(remarks)">Confirm</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 380px; max-width: 100%; }`]
})
export class RemarksDialogComponent {
  readonly ref = inject(MatDialogRef<RemarksDialogComponent>);
  readonly data = inject<RemarksDialogData>(MAT_DIALOG_DATA);
  remarks = '';
}
