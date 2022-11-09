export const hcHome = {
    route: '/help-center',
    name: 'Help Center Homepage',
    fields: [
        {
            name: 'Background',
            type: 'image',
            key: 'hc.home.background',
            selector: '.jumbotron',
        },
        {
            name: 'Title',
            key: 'hc.home.title',
            selector: '.title',
        },
        {
            name: 'Subtitle',
            key: 'hc.home.subtitle',
            selector: '.subtitle'
        },
        {
            name: 'Search Field Placeholder',
            key: 'hc.home.search-placeholder',
            selector: '.search-input',
        }
    ]
};
