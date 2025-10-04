# Demiren Hotel System (Admin Side) 4.0

This project focuses on the admin side of the project. If you want to check the customer's side click the link to check my friend's project [beabanana](https://github.com/wannabeayours/Reactjs-Demirens).

### Update Logs
### 4.0 (October 3, 2025)

## `Booking List Page`
- Updated the extended room to handle multiple rooms and made it less confusing.
- Added a Ascending and Descending order for the when the booking was created.
- Updated UI of modals
- Fixed bugs in their modal functions
- Added validation if the customer has not fully paid it would not let the customer "Check-Out" and send them into the `Invoices.jsx` page

## `Minor Updates`
- Fixed the issue of Master Files that it can't be accessed
- UI changes in `RoomList.jsx`
- Updated UI and Functions of `Dashboard.jsx`
- Added Thousand Seperator
- Upgraded the Add Request Amenities modal and choosing book list.
- Searchbar in Invoices


### 3.1.5 (September 30, 2025)
## `Employee Management Page`
- For now, can add employee either Admin or Employee
- Added a new page `EmployeeManagement.jsx`

## `Invoice Page`
- Added the new page structure in `Invoice.jsx`
- Changed some UI

## `Security`
- Admin can now log in the same login page
- Required to login in as Admin to access Admin features/pages
- Status can update when logging in or out

Need to Add:
- Further debugging for testing
- Upgrades to the UI to match


### 3.1.1 (September 29, 2025)
## `General`
- Set the Check-in to be at 2PM and Check-out at 12PM
- Added an Invoice page
- Fixed an issue when adding a new Walk-in in `WalkIn_Folder`
- Changed Input Types from Numbers to Text
- Slightly changed the UI in `PaymentMethod.jsx` to make the total more noticable

## `Booking List Page`
- Remaining Balance is shown now
- Disabled Extend and Change Rooms if Customer is Pending
- Upgraded the Extended Stay in rooms to handle multiple rooms 

## `Add Amenities Page`
- Fixed a Bug when Adding Amenities, now it confirms you successfully added a new amenity
- Changed the UI in `AddAmenityRequestModal.jsx` modal
- Changed the UI in `BookingRoomSelection.jsx` modal
