import {Octokit} from "@octokit/rest";
import OpenAI from "openai";
import path from "node:path";
import {executeGPT} from "./openai";

const ocktokit = new Octokit({
    auth: process.env.DEFINITION_OF_DONE_GITHUB_TOKEN
});

const doReview = 'You are a software developer that needs to review a code patch, please provide the user' +
    'a brief code review, include feedback on bugs or maintainability improvement suggestions in your review.' +
    'Give your review as a JSON output containing the line number and a description for each finding.' +
    'Limit your review to 10 findings but only include findings you are absolutely sure about.';

const doSummary = 'You are a software developer that needs to summarize a code patch, please provide the user' +
    'a brief summary, include feedback on bugs or maintainability improvement suggestions in your review.';

async function getLargestPatch(owner: string, repo: string, baseSha: string, headSha: string) {
    const {data: compare} = await ocktokit.repos.compareCommits({
        owner: owner,
        repo: repo,
        base: baseSha,
        head: headSha
    });
    const result = {filename: '', patch: ''};
    const ignore = ['.json', '.md', '.lock'];
    if (compare.files) {
        for (const file of compare.files) {
            const extension = path.extname(file.filename).toLowerCase();
            if (ignore.includes(extension))
                continue;
            if (file.patch && file.patch.length > result.patch.length) {
                result.filename = file.filename;
                result.patch = file.patch;
            }
        }
    }
    return result;
}

async function getPullRequest(owner: string, repo: string, pull_number: number) {
    const {data: result} = await ocktokit.pulls.get({
        owner: owner,
        repo: repo,
        pull_number: pull_number
        // mediaType: {
        //     format: "patch",
        // }
    });
    return result;
}

async function getPullRequestDiff(owner: string, repo: string, pull_number: number) {
    const {data: result} = await ocktokit.pulls.get({
        owner: owner,
        repo: repo,
        pull_number: pull_number,
        mediaType: {
            format: "patch",
        }
    });
    return result;
}

(async () => {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log('usage: node src/index.js <owner> <repo> <pull_number>');
        return;
    }

    // const pr = await getPullRequest(args[0], args[1], parseInt(args[2]));
    // console.log(pr.base.sha);
    // const largest = await getLargestPatch(args[0], args[1], pr.base.sha, pr.head.sha);
    // console.log(largest);

    const diff = await getPullRequestDiff(args[0], args[1], parseInt(args[2]));
    const result = await executeGPT(doReview, `Please summarize this code patch:\n${diff}\n`);
    console.log(result);
})();