import { a } from './lib';

for (const [key, value] of Object.values(a)) {
    console.log(`${key}:${value}`);
}

alert(a)

export default a;
