import { LambdaEvent, ApiResponse } from './types';
interface CodePipelineEvent {
    'CodePipeline.job': {
        id: string;
    };
}
interface CodePipelineContext {
    awsRequestId: string;
}
export declare const handler: (event: LambdaEvent | CodePipelineEvent, context?: CodePipelineContext) => Promise<ApiResponse | void>;
export {};
