import {Component, Input, ViewEncapsulation} from '@angular/core';
import {HelpCenterService} from "../help-center.service";

@Component({
    selector: 'article-feedback',
    templateUrl: './article-feedback.component.html',
    styleUrls: ['./article-feedback.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ArticleFeedbackComponent {

    /**
     * Article feedback should be attached to.
     */
    @Input() private articleId: number;

    /**
     * True if user has already submitted feedback for this article.
     * For notification purposes only, will always be false after page refresh.
     * Backend will handle duplicate feedback from same user / Client IP.
     */
    public feedbackAlreadySubmitted = false;

    /**
     * Whether user marked article as helpful or not.
     */
    public wasHelpful = null;

    /**
     * ArticleFeedbackComponent Constructor.
     */
    constructor(private helpCenter: HelpCenterService) {}

    /**
     * Submit user feedback about currently open article.
     */
    public submitFeedback(wasHelpful: boolean) {
        this.helpCenter.submitArticleFeedback(this.articleId, {was_helpful: wasHelpful}).subscribe(() => {
            this.feedbackAlreadySubmitted = true;
        });
    }
}
