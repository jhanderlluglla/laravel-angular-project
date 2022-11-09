export const general = {
    name: 'General',
    route: '/help-center',
    fields: [
        {
            name: 'Logo #1 (on colored background)',
            type: 'image',
            key: 'branding.hc_logo',
            image_type: 'src',
            selector: '.logo',
        },
        {
            name: 'Logo #2 (on white background)',
            type: 'image',
            key: 'branding.site_logo',
            image_type: 'src',
            selector: '.logo',
        },
        {
            name: 'Favicon',
            type: 'image',
            key: 'branding.favicon',
        },
        {
            name: 'Site Name',
            type: 'text',
            key: 'branding.site_name',
        },
        {
            name: 'Site Url',
            type: 'text',
            input_type: 'url',
            key: 'branding.site_url',
        }
    ]
};