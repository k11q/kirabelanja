<template>
	<div class="flex flex-col items-center">
		<div class="max-w-7xl">
			<select
				v-model.lazy="state"
				class="border"
				placeholder="state"
			>
				<option value="">Whole Malaysia</option>
				<option
					v-for="state in listStates"
					:value="state"
				>
					{{ state }}
				</option>
			</select>
			<input
				v-model.lazy="limit"
				class="border"
				placeholder="limit"
			/>
			{{ selectedItems }}
			<HeadlessCombobox
				v-model="selectedItems"
				name="items"
				multiple
			>
				<HeadlessComboboxInput
					@change="
						queryItems = $event.target.value
					"
					:displayValue="(item) => item.item"
				/>
                                <div class="relative">
                                <div class="absolute mt-1 w-full rounded-md bg-white shadow-lg">
				<HeadlessComboboxOptions
					class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
				>
					<HeadlessComboboxOption
						v-slot="{ active, selected }"
						v-for="item in items"
						:key="item.id"
						:value="item"
						><li
							:class="[
								active
									? 'bg-amber-100 text-amber-900'
									: 'text-gray-900',
								'relative cursor-default select-none py-2 pl-10 pr-4',
							]"
						>
							<span
								:class="[
									selected
										? 'font-medium'
										: 'font-normal',
									'block truncate',
								]"
								>{{
									item.item
								}}</span
							>
							<span
								v-if="selected"
								class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"
							>
								Selected
							</span>
						</li>
					</HeadlessComboboxOption>
				</HeadlessComboboxOptions>
                        </div>
                </div>
			</HeadlessCombobox>
			<input
				v-model.lazy="date"
				class="border"
				placeholder="date"
			/>
			<div
				v-if="allPremisesData"
				v-for="premiseSection in allPremisesData.sort(
					function (a, b) {
						return b.length - a.length;
					}
				)"
			>
				<h2 class="px-4 text-2xl font-semibold">Total Items: {{ premiseSection.length }}</h2>
				<div class="grid grid-cols-3 gap-3 p-4">
					<div
						v-for="premise in premiseSection.premises.sort(
							function (a, b) {
								return (
									a.total -
									b.total
								);
							}
						)"
						class="border p-4 justify-between flex flex-col gap-2"
					>
						<div
							class="flex flex-col gap-2"
						>
							<div class="mb-2">
								{{
									premise.premise_name
								}}
							</div>
							<div
								v-for="(
									item,
									index
								) in premise.items"
								class="grid grid-cols-8 text-xs"
							>
								<div class="col-span-6 flex">
                                                                <div class="w-6 flex-none">{{ index + 1 }}</div>
                                                                <div>{{
										item.item
									}}</div>
									
								</div>
								<div class="col-span-2 text-right tabular-nums">
									{{
										parseFloat(
											item.price
										).toFixed(
											2
										)
									}}
								</div>
							</div>
						</div>
						<div></div>
						<div class="self-end">
							Total:
							{{ premise.total }}
						</div>
					</div>
				</div>
			</div>
			<!--
                <table class="whitespace-nowrap">
                <thead class=" grid " style="grid-template-columns: repeat(14, minmax(0, 1fr));">
                <th class="col-span-3">Item</th>
                <th class="col-span-1">Unit</th>
                <th class="col-span-1">Price</th>
                <th class="col-span-2">Premise</th>
                <th class="col-span-2">Address</th>
                <th class="col-span-1">District</th>
                <th class="col-span-1">State</th>
                <th class="col-span-1">Date</th>
                <th class="col-span-2">Category</th>
        </thead>
                <tbody>
		<tr v-if="item_prices" v-for="item in item_prices.sort(function(x, y){return x?.price - y?.price})" class="border-y grid max-w-full [&>*]:overflow-hidden [&>*]:text-ellipsis" style="grid-template-columns: repeat(14, minmax(0, 1fr));">
                <td class="col-span-3">{{ item?.item }}</td>
                <td class="col-span-1">{{ item?.unit }}</td>
                <td class="col-span-1">{{ item?.price }}</td>
                <td class="col-span-2">{{ item?.premise }}</td>
                <td class="col-span-2">{{ item?.address }}</td>
                <td class="col-span-1">{{ item?.district }}</td>
                <td class="col-span-1">{{ item?.state }}</td>
                <td class="col-span-1">{{ item?.date }}</td>
                <td class="col-span-2">{{ item?.item_category }}</td>
		</tr>
        </tbody>
        </table>
        -->
		</div>
	</div>
</template>

<script setup>
const client = useSupabaseClient();

const listStates = [
	"Labuan",
	"Kuala Lumpur",
	"Selangor",
	"Perak",
	"Perlis",
	"Sabah",
	"Sarawak",
	"Kedah",
	"Negeri Sembilan",
	"Putrajaya",
	"Melaka",
	"Terengganu",
	"Kelantan",
	"Pahang",
	"Kedah",
	"Pulau Pinang",
	"Johor",
];
const limit = ref(1000);
const date = ref("2023-03-14");
const state = ref("Kuala Lumpur");
const queryItems = ref();
const selectedItems = ref([]);
const selectedItemsCode = computed(() => {
	if (selectedItems.value) {
		const arr = selectedItems.value.map((item) => item.item_code);
		return arr;
	}
	return null;
});

const { data: items } = await useAsyncData(
	"items",
	async () => {
		let query = client
			.from("lookup_item")
			.select("item, item_code");
		if (queryItems.value) {
			query = query.ilike("item", `%${queryItems.value}%`);
		}
		query = query.limit(20);
		const { data } = await query;
		return data;
	},
	{ watch: queryItems }
);

const { data: item_prices } = await useAsyncData(
	"item_prices",
	async () => {
		let query = client.from("item_prices").select("*");
		if (selectedItemsCode.value) {
			query = query.in("item_code", selectedItemsCode.value);
		}
		if (state.value) {
			query = query.textSearch("state", `'${state.value}'`, {
				type: "plain",
			});
		}
		if (date.value) {
			query = query.eq("date", date.value);
		}
		query = query.limit(limit.value);
		const { data, error } = await query;
		return data;
	},
	{ watch: [state, selectedItems, date, limit] }
);

const allStates = computed(() => {
	return item_prices.value
		.map((item) => item.state)
		.filter((value, index, self) => self.indexOf(value) === index);
});

const allPremises = computed(() => {
	if (item_prices.value) {
		return item_prices.value
			.map((item) => item.premise_code)
			.filter(
				(value, index, self) =>
					self.indexOf(value) === index
			);
	}
	return [];
});

const allPremisesData = computed(() => {
	if (allPremises.value.length) {
		let data = [];
		let length = 0;
		allPremises.value.forEach((i) => {
			const premiseName = item_prices.value.find(
				(j) => j.premise_code == i
			)?.premise;
			const obj = [];
			const allItems = item_prices.value.filter(
				(j) => j.premise_code == i
			);
			length = allItems.length;
			let total = 0;
			allItems.forEach((item) => {
				if (!isNaN(parseFloat(item.price))) {
					total += parseFloat(item.price);
				}
				obj.push({
					item: item.item,
					price: item.price,
				});
			});
			total = total.toFixed(2);
			if (
				data.length &&
				data.find((i) => i.length == length)
			) {
				data[
					data.findIndex(
						(i) => i.length == length
					)
				].premises.push({
					premise_name: premiseName,
					items: obj,
					total: total,
				});
			} else {
				data.push({
					length: length,
					premises: [
						{
							premise_name:
								premiseName,
							items: obj,
							total: total,
						},
					],
				});
			}
		});
		return data;
	}
	return [];
});
</script>
