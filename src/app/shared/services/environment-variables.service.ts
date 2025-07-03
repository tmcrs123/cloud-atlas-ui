import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class EnvironmentVariablesService {
    public getEnvironmentValue<K extends keyof typeof environment>(key: K): string {
        return environment[key];
    }
}