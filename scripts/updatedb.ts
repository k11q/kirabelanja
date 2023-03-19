import axios from "axios";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const bucket = "dosm-public-pricecatcher";
const all_file_name = ["lookup_item", "lookup_premise", "pricecatcher_2023-03"];

async function insertDataToSupabase(tableName: string, data) {
	if (tableName.slice(0, 12) == "pricecatcher") {
		const totalRows = data.length;
		console.log("data length: " + totalRows);
		const chunkSize = 1000;
		const totalChunks = Math.ceil(totalRows / chunkSize);

		for (let i = 0; i < totalChunks; i++) {
			const startIndex = i * chunkSize;
			const endIndex = Math.min(
				(i + 1) * chunkSize,
				totalRows
			);
			const chunk = data.slice(startIndex, endIndex);

			const { error } = await supabase
				.from("pricecatcher_prices")
				.insert(chunk);
			if (error) {
				console.error(
					`Error inserting data into table pricecatcher_prices:`,
					error
				);
			} else {
				console.log(
					`Data chunk ${
						i + 1
					}/${totalChunks} successfully inserted into table ${tableName}.`
				);
			}
		}
	} else {
		const { error } = await supabase.from(tableName).insert(data);
		if (error) {
			console.error(
				"Error inserting data into Supabase:",
				error
			);
		} else {
			console.log(
				"Data successfully inserted into Supabase."
			);
		}
	}
}

async function deleteAllRowsFromTable(tableName: string) {
	const { error } = await supabase
		.from(
			tableName.slice(0, 12) == "pricecatcher"
				? "pricecatcher_prices"
				: tableName
		)
		.delete()
		.gte("id", 0);
	if (error) {
		console.error("Error deleting rows from the table:", error);
	} else {
		console.log("All rows successfully deleted from the table.");
	}
}

all_file_name.forEach((filename) => {
	axios.get(`https://storage.googleapis.com/${bucket}/${filename}.csv`)
		.then(async (response) => {
			const parsedData = Papa.parse(response.data, {
				header: true,
				skipEmptyLines: true,
			});
			if (filename.slice(0, 12) != "pricecatcher") {
				await deleteAllRowsFromTable(filename);
			}
			await insertDataToSupabase(filename, parsedData.data);
		})
		.catch((error) => {
			console.error("Error fetching CSV file:", error);
		});
});
