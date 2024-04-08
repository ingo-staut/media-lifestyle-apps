import { Pipe, PipeTransform } from "@angular/core";
import { FormArray, FormGroup, ValidationErrors } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";

interface AllValidationErrors {
  controlName: string;
  errorName: string;
  errorValue: any;
}

@Pipe({
  name: "formErrors",
})
export class FormErrorsPipe implements PipeTransform {
  messages: Record<string, string> = {
    amountText: "PORTION.UNIT",
    name: "TITLE",
    category: "CATEGORY.",
    temperature: "TEMPERATURE",
  };

  constructor(private translateService: TranslateService) {}

  private calculateErrors(form: FormGroup | FormArray, errors: AllValidationErrors[]) {
    Object.keys(form.controls).forEach((field) => {
      const control = form.get(field);
      if (control instanceof FormGroup || control instanceof FormArray) {
        errors = errors.concat(this.calculateErrors(control, errors));
        return;
      }

      const controlErrors: ValidationErrors | null = control?.errors ?? null;
      if (controlErrors !== null) {
        Object.keys(controlErrors).forEach((keyError) => {
          errors.push({
            controlName: field,
            errorName: keyError,
            errorValue: controlErrors[keyError],
          });
        });
      }
    });

    // This removes duplicates
    errors = errors.filter(
      (error, index, self) =>
        self.findIndex((t) => {
          return t.controlName === error.controlName && t.errorName === error.errorName;
        }) === index
    );
    return errors;
  }

  private getErrorMessage(error: AllValidationErrors, hightlight: boolean) {
    const before = hightlight ? "<span class='text-color-1'>" : "";
    const after = hightlight ? "</span>" : "";

    switch (error.errorName) {
      case "required":
        return (
          before +
          this.translateService.instant(this.messages[error.controlName]) +
          ": " +
          after +
          this.translateService.instant("FIELD.MANDATORY")
        );
      default:
        return (
          before +
          this.translateService.instant(this.messages[error.controlName]) +
          ": " +
          after +
          this.translateService.instant("FIELD.NOT_SET")
        );
    }
  }

  private getErrorMessages(formGroup: FormGroup, hightlight: boolean) {
    var errors: AllValidationErrors[] = [];
    return this.calculateErrors(formGroup, errors).map((error) =>
      this.getErrorMessage(error, hightlight)
    );
  }

  /**
   * @param _ Triggert nur die Pipe bei einer Formular-Änderung
   * @param formGroup Formular
   * @returns Alle Fehler als Text
   */
  transform(_: any, formGroup: FormGroup, hightlight: boolean = false): string[] {
    return this.getErrorMessages(formGroup, hightlight);
  }
}
