import { AuthCanDo } from '@bemit/auth-perms/AuthCanDo'

export const defaultAbilities: {
    'System.Admin': {}
    'System.Maintenance': {}
    'System.User': {}
} = {
    'System.Admin': {},
    'System.Maintenance': {},
    'System.User': {},
}

const defaultDirectory = 'js-dev-starter'

export const authCanDo = new AuthCanDo(
    defaultAbilities,
    {
        abilityToScope: (ability) => defaultDirectory + '/' + ability,
        roles: {
            admin: {
                scope: `${defaultDirectory}.admin`,
                abilities: ['System.Admin', 'System.Maintenance', 'System.User'],
            },
            dev: {
                scope: `${defaultDirectory}.dev`,
                abilities: ['System.Maintenance', 'System.User'],
            },
            member: {
                scope: `${defaultDirectory}.member`,
                abilities: ['System.User'],
            },
        },
    },
)
