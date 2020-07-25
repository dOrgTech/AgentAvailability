// @ts-ignore ts(6059): we want to import from package.json outside /src 
import { engines } from '../../package.json'
import semver from 'semver'
const version = engines.node;
if (!semver.satisfies(process.version, version)) {
    throw new Error(`The current node version${process.version} does not satisfy the required version ${version} .`);
}