# Salesforce Duplicate Record Manager LWC

A Lightning Web Component (LWC) for Salesforce that helps identify and manage duplicate record based on email addresses.

## Features
- Identifies duplicate records by email.
- Displays duplicates in a table with details
- Allows deleting individual duplicates or merging them (keeps the most recent record).
- Refresh button to re-fetch duplicates.

## Installation
1. Add the `duplicateRecordManager` component to a Lightning page via the App Builder.

## Usage
- Add the component to any Lightning page.
- Customize it based on your Objects (By default it identified duplicate leads)
- Use it to maintain data quality by identifying and resolving duplicate records.