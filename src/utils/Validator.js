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
        let subject = {};
        Object.keys(this.subject).filter((fieldName) => {
            return this._results[fieldName] !== "success";
        }).map((fieldName) => {
            subject[fieldName] = this.subject[fieldName];
            this._results[fieldName] = {status: "validating", message: null};
        });
        this.results = this._results;
        
        this.validator.validate(subject, (errors, fields) => {
            Object.keys(subject).map((fieldName) => {
                this._results[fieldName] = {status: "success", message: null};
            });
            if (errors) {
                // error
                Object.keys(fields).map((fieldName) => {
                    this._results[fieldName] = {status: "error", message: fields[fieldName][0].message}
                });
                this.results = this._results;
                fail && fail(this._results);
            } else {
                // success
                this.results = this._results;
                success && success(this._results);
            }
        })
    };

    validateField = (fieldName, success, error) => {
        let subject = {[fieldName]: this.subject[fieldName]};
        this._results[fieldName] = {status: "validating", message: null};
        this.results = this._results;

        this.validator.validate(subject, (errors, fields) => {
            if (errors) {
                // error
                this._results[fieldName] = {status: "error", message: errors[0].message};
                this.results = this._results;
                error && error(this._results[fieldName]);
            } else {
                // success
                this._results[fieldName] = {status: "success", message: null};
                this.results = this._results;
                success && success(this._results[fieldName]);
            }
        })
    };
}
