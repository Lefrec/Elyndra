/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Entity = "Entity",
	EntityZzegnoy4tcj8qpt = "Entity_zzegnoy4tcj8qpt",
	Inventory = "Inventory",
	InventoryZzegnoy4tcj8qpt = "Inventory_zzegnoy4tcj8qpt",
	Player = "Player",
	PlayerZzegnoy4tcj8qpt = "Player_zzegnoy4tcj8qpt",
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type EntityRecord = {
	created: IsoAutoDateString
	desc?: string
	hp?: number
	id: string
	name?: string
	updated: IsoAutoDateString
}

export type EntityZzegnoy4tcj8qptRecord = {
	created: IsoAutoDateString
	currentHP?: number
	desc?: string
	id: string
	name?: string
	updated: IsoAutoDateString
}

export type InventoryRecord = {
	amount?: number
	created: IsoAutoDateString
	desc?: string
	id: string
	name?: string
	updated: IsoAutoDateString
}

export type InventoryZzegnoy4tcj8qptRecord = {
	amount?: number
	created: IsoAutoDateString
	desc?: string
	id: string
	name?: string
	updated: IsoAutoDateString
}

export enum PlayerClassOptions {
	"knight" = "knight",
	"mage" = "mage",
	"shadow" = "shadow",
	"alchemist" = "alchemist",
}
export type PlayerRecord = {
	class?: PlayerClassOptions
	con?: number
	created: IsoAutoDateString
	currentHP?: number
	dex?: number
	id: string
	int?: number
	isCurrent?: boolean
	maxHP?: number
	name?: string
	str?: number
	updated: IsoAutoDateString
	user?: RecordIdString
}

export type PlayerZzegnoy4tcj8qptRecord = {
	created: IsoAutoDateString
	id: string
	name?: string
	updated: IsoAutoDateString
}

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type EntityResponse<Texpand = unknown> = Required<EntityRecord> & BaseSystemFields<Texpand>
export type EntityZzegnoy4tcj8qptResponse<Texpand = unknown> = Required<EntityZzegnoy4tcj8qptRecord> & BaseSystemFields<Texpand>
export type InventoryResponse<Texpand = unknown> = Required<InventoryRecord> & BaseSystemFields<Texpand>
export type InventoryZzegnoy4tcj8qptResponse<Texpand = unknown> = Required<InventoryZzegnoy4tcj8qptRecord> & BaseSystemFields<Texpand>
export type PlayerResponse<Texpand = unknown> = Required<PlayerRecord> & BaseSystemFields<Texpand>
export type PlayerZzegnoy4tcj8qptResponse<Texpand = unknown> = Required<PlayerZzegnoy4tcj8qptRecord> & BaseSystemFields<Texpand>
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	Entity: EntityRecord
	Entity_zzegnoy4tcj8qpt: EntityZzegnoy4tcj8qptRecord
	Inventory: InventoryRecord
	Inventory_zzegnoy4tcj8qpt: InventoryZzegnoy4tcj8qptRecord
	Player: PlayerRecord
	Player_zzegnoy4tcj8qpt: PlayerZzegnoy4tcj8qptRecord
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	users: UsersRecord
}

export type CollectionResponses = {
	Entity: EntityResponse
	Entity_zzegnoy4tcj8qpt: EntityZzegnoy4tcj8qptResponse
	Inventory: InventoryResponse
	Inventory_zzegnoy4tcj8qpt: InventoryZzegnoy4tcj8qptResponse
	Player: PlayerResponse
	Player_zzegnoy4tcj8qpt: PlayerZzegnoy4tcj8qptResponse
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
