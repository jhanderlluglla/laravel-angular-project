// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
    id: string;
}

declare module 'chart.js';

///<reference path="typings/models/Action.d.ts" />
///<reference path="typings/models/CannedReply.d.ts" />
///<reference path="typings/models/Condition.d.ts" />
///<reference path="typings/models/Group.d.ts" />
///<reference path="typings/models/HcArticle.d.ts" />
///<reference path="typings/models/HcArticleFeedback.d.ts" />
///<reference path="typings/models/HcCategory.d.ts" />
///<reference path="typings/models/HcFolder.d.ts" />
///<reference path="typings/models/Operator.d.ts" />
///<reference path="typings/models/Reply.d.ts" />
///<reference path="typings/models/Setting.d.ts" />
///<reference path="typings/models/SocialProfile.d.ts" />
///<reference path="typings/models/Tag.d.ts" />
///<reference path="typings/models/Ticket.d.ts" />
///<reference path="typings/models/Trigger.d.ts" />
///<reference path="typings/models/Upload.d.ts" />
///<reference path="typings/models/User.d.ts" />