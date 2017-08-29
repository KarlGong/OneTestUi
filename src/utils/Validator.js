import Schema from "async-validator";

export default class Validator {
    validator = null;
    subject = null;
    results = {};

    constructor(subject, descriptor) {
        this.subject = subject;
        this.validator = new Schema(descriptor);
        this.setResults({status: null, message: null});
    }

    setResults = (result) => {
        Object.keys(this.subject).map((fieldName) => {
            this.results[fieldName] = result;
        })
    };

    validate = (success, fail) => {
        this.setResults({status: "validating", message: null});
        this.validator.validate(this.subject, (errors, fields) => {
            this.setResults({status: "success", message: null});
            if (errors) {
                Object.keys(fields).map((field) => {
                    this.results[field] = {status: "error", message: fields[field][0].message}
                });
                fail && fail(this.results);
            } else {
                success && success(this.results);
            }
        })
    };

    validateField = (fieldName, success, fail) => {
        this.results[fieldName] = {status: "validating", message: null};
        this.validator.validate({[fieldName]: this.subject[fieldName]}, (errors, fields) => {
            if (errors) {
                this.results[fieldName] = {status: "error", message: errors[0].message};
                fail && fail(this.results[fieldName]);
            } else {
                this.results[fieldName] = {status: "success", message: null};
                success && success(this.results[fieldName]);
            }
        })
    };
}
