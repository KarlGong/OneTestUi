import Schema from "async-validator";
import {observable, runInAction, action, isObservable} from "mobx";

export default class Validator {
    validator;
    subject;
    _results = {};
    @observable results = {};

    constructor(subject, descriptor) {
        this.subject = subject;
        this.validator = new Schema(descriptor);
        this.setResults({status: null, message: null});
        this.results = this._results;
    }

    setResults = (result) => {
        Object.keys(this.subject).map((fieldName) => {
            this._results[fieldName] = result;
        })
    };

    validate = (success, fail) => {
        this.setResults({status: "validating", message: null});
        this.validator.validate(this.subject, (errors, fields) => {
            this.setResults({status: "success", message: null});
            if (errors) {
                Object.keys(fields).map((field) => {
                    this._results[field] = {status: "error", message: fields[field][0].message}
                });
                this.results = this._results;
                fail && fail(this._results);
            } else {
                this.results = this._results;
                success && success(this._results);
            }
        })
    };

    validateField = (fieldName, success, fail) => {
        this._results[fieldName] = {status: "validating", message: null};
        this.validator.validate({[fieldName]: this.subject[fieldName]}, (errors, fields) => {
            if (errors) {
                this._results[fieldName] = {status: "error", message: errors[0].message};
                this.results = this._results;
                fail && fail(this._results[fieldName]);
            } else {
                this._results[fieldName] = {status: "success", message: null};
                this.results = this._results;
                success && success(this._results[fieldName]);
            }
        })
    };
}
