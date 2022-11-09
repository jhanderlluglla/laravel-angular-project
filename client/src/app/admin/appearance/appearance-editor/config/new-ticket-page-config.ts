export const newTicketPage = {
    name: 'New Ticket Page',
    route: '/help-center/tickets/new',
    fields: [
        {
            name: 'Title',
            type: 'text',
            key: 'hc.new-ticket.title',
            selector: 'h1',
        },
        {
            name: 'Category Label',
            type: 'text',
            key: 'hc.new-ticket.category_label',
            selector: '.category-input-container label',
        },
        {
            name: 'Subject Label',
            type: 'text',
            key: 'hc.new-ticket.subject_label',
            selector: '.subject-input-container label',
        },
        {
            name: 'Description Label',
            type: 'text',
            key: 'hc.new-ticket.description_label',
            selector: '.description-input-container label',
        },
        {
            name: 'Submit Button Text',
            type: 'text',
            key: 'hc.new-ticket.submit_button_text',
            selector: '.submit-button',
        },
        {
            name: 'Sidebar Title',
            type: 'text',
            key: 'hc.new-ticket.sidebar_title',
            selector: '.right-column .header',
        },
        {
            name: 'Sidebar Tips',
            type: 'list',
            key: 'hc.new-ticket.sidebar_tips',
            selector: '.right-column .tips',
        },
    ]
};