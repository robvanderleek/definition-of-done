import {ApplicationFunctionOptions, Probot} from "probot";

export default (app: Probot, _: ApplicationFunctionOptions) => {
    app.log('Hello world!');
}
