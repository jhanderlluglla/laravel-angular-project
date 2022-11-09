import {User} from "../src/app/shared/models/User";
import * as Faker from 'faker';
import {Tag} from "../src/app/shared/models/Tag";
import {Email} from "../src/app/shared/models/Email";
import {Ticket} from "../src/app/shared/models/Ticket";
import {Group} from "../src/app/shared/models/Group";
import {SocialProfile} from "../src/app/shared/models/SocialProfile";
import {Article} from "../src/app/shared/models/Article";
import {Upload} from "../src/app/shared/models/Upload";
import {Reply} from "../src/app/shared/models/Reply";
import {Category} from "../src/app/shared/models/Category";
import {UserDetails} from "../src/app/shared/models/UserDetails";

class ModelFactory {
    public factories = {};

public define(model: string, data: Object) {
    this.factories[model] = data;
}

public make(model: string, count: number = 1, data = {}): any {
    if (count === 1) {
        return Object.assign({}, this.factories[model](), data);
    }

    let fakes = [];

    for (let i = 1; i <= count; i++) {
        fakes.push(Object.assign({}, this.factories[model](), data));
    }

    return fakes;
}
}

export let modelFactory = new ModelFactory();

modelFactory.define('Upload', () => {
    return new Upload({
        id: Faker.random.number(100),
        name: Faker.random.word(),
        file_name: Faker.system.fileName('foo', 'bar'),
        mime: Faker.system.mimeType(),
    });
});

modelFactory.define('Tag', () => {
    return new Tag({
        id: Faker.random.number(100),
        name: Faker.random.word(),
        display_name: Faker.random.word()
    });
});

modelFactory.define('UserDetails', () => {
    return new UserDetails({
        id: Faker.random.number(100),
        details: Faker.lorem.words(3),
        notes: Faker.lorem.words(3),
    });
});

modelFactory.define('Email', () => {
    return new Email({
        id: Faker.random.number(100),
        address: Faker.internet.email(),
    });
});

modelFactory.define('Group', () => {
    return new Group({
        id: Faker.random.number(100),
        name: Faker.random.word(),
        default: 0,
    });
});

modelFactory.define('SocialProfile', () => {
    return new SocialProfile({
        id: Faker.random.number(100),
        username: Faker.internet.userName(),
        service_name: Faker.random.word(),
    });
});

modelFactory.define('User', () => {
    return new User({
        id: Faker.random.number(100),
        email: Faker.internet.email(),
        avatar: Faker.image.avatar(),
        display_name: Faker.name.firstName(),
        tags: modelFactory.make('Tag', 2),
        details: modelFactory.make('UserDetails'),
        secondary_emails: modelFactory.make('Email', 2),
        social_profiles: modelFactory.make('SocialProfile', 2),
        groups: modelFactory.make('Group', 2),
        permissions: {foo: 'bar'},
        has_password: true,
    })
});

modelFactory.define('Reply', () => {
    return new Reply({
        id: Faker.random.number(100),
        body: Faker.random.words(5),
        user: modelFactory.make('User'),
        uploads: [],
    });
});

modelFactory.define('CannedReply', () => {
    return new Reply({
        id: Faker.random.number(100),
        name: Faker.random.words(1),
        body: Faker.random.words(2),
        user_id: Faker.random.number(100),
    });
});

modelFactory.define('Ticket', () => {
    return new Ticket({
        id: Faker.random.number(100),
        subject: Faker.random.words(4),
        replies: [modelFactory.make('Reply')],
        replies_count: 1,
        updated_at_formatted: 'foo',
        user: modelFactory.make('User'),
    });
});

modelFactory.define('Article', () => {
    return new Article({
        id: Faker.random.number(100),
        title: Faker.random.words(4),
        body: Faker.random.words(5),
        description: Faker.random.words(3),
        slug: Faker.random.words(2).split(' ').join('-').toLowerCase(),
        draft: 0,
        position: Faker.random.number(100),
    });
});

modelFactory.define('Category', () => {
    return new Category({
        id: Faker.random.number(100),
        name: Faker.random.words(2),
        position: Faker.random.number(20),
        default: false,
        children: [],
    });
});