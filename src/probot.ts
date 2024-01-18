import {ApplicationFunctionOptions, Probot} from "probot";

export default (app: Probot, _: ApplicationFunctionOptions) => {
    app.log('Easy GitHub GPT');
    app.onAny(async (ctx: any) => {
        app.log(`Received webhook event: ${ctx.name}.${ctx.payload.action}`)
    });
}
