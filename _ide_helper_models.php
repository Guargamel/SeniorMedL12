<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $medicine_id
 * @property int $quantity
 * @property string $distribution_date
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \App\Models\Medicine $medicine
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distribution newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distribution newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distribution query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distribution whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distribution whereDistributionDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distribution whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distribution whereMedicineId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distribution whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distribution whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Distribution whereUserId($value)
 */
	class Distribution extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $generic_name
 * @property string|null $brand_name
 * @property string $dosage_form
 * @property string $strength
 * @property int|null $category_id
 * @property string $unit
 * @property string|null $description
 * @property bool|null $is_active
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property string|null $picture
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MedicineBatch> $batches
 * @property-read int|null $batches_count
 * @property-read \App\Models\MedicineCategory|null $category
 * @property-read Medicine|null $medicine
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine whereBrandName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine whereCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine whereDosageForm($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine whereGenericName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine wherePicture($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine whereStrength($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine whereUpdatedAt($value)
 */
	class Medicine extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $medicine_id
 * @property string $batch_no
 * @property \Illuminate\Support\Carbon $expiry_date
 * @property int $quantity
 * @property \Illuminate\Support\Carbon|null $received_at
 * @property int|null $supplier_id
 * @property numeric|null $cost
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Medicine $medicine
 * @property-read \App\Models\Supplier|null $supplier
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch whereBatchNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch whereCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch whereExpiryDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch whereMedicineId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch whereReceivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch whereSupplierId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineBatch whereUpdatedAt($value)
 */
	class MedicineBatch extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property string|null $description
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Medicine> $medicines
 * @property-read int|null $medicines_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineCategory whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineCategory whereUpdatedAt($value)
 */
	class MedicineCategory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $medicine_id
 * @property int $quantity
 * @property string|null $reason
 * @property string $status
 * @property string|null $notes
 * @property int|null $reviewed_by
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property string|null $review_notes
 * @property-read \App\Models\Medicine $medicine
 * @property-read \App\Models\User|null $reviewer
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest approved()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest declined()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest pending()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereMedicineId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereReviewNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereReviewedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereReviewedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MedicineRequest whereUserId($value)
 */
	class MedicineRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Medicine> $medicines
 * @property-read int|null $medicines_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine_Category newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine_Category newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Medicine_Category query()
 */
	class Medicine_Category extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $type
 * @property string $notifiable_type
 * @property string $title
 * @property string $message
 * @property int $notifiable_id
 * @property array<array-key, mixed> $data
 * @property \Illuminate\Support\Carbon|null $read_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $user_id
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification ofType($type)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification read()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification unread()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereData($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereNotifiableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereNotifiableType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereUserId($value)
 */
	class Notification extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string|null $birthdate
 * @property string|null $sex
 * @property string|null $contact_no
 * @property string|null $barangay
 * @property string|null $address
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile whereBarangay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile whereBirthdate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile whereContactNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile whereSex($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SeniorProfile whereUserId($value)
 */
	class SeniorProfile extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $company
 * @property string|null $address
 * @property string|null $product
 * @property string|null $comment
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereCompany($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereProduct($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Supplier whereUpdatedAt($value)
 */
	class Supplier extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $role_id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $avatar
 * @property string|null $phone
 * @property string|null $address
 * @property string|null $bio
 * @property-read string|null $avatar_url
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \App\Models\SeniorProfile|null $seniorProfile
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAvatar($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBio($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRoleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, $guard = null)
 */
	class User extends \Eloquent {}
}

