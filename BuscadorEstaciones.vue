<script setup lang="ts">
	import { onMounted } from "vue";
	import { ref } from "vue";
	//import ListadoEstaciones from "./ListadoEstaciones.vue";

	const props = defineProps<{
		googleMap: google.maps.Map;
		placesService: google.maps.places.PlacesService;
	}>();

	let texto = ref("");
	const items = ref<any>([]);
	let resultadosGoogle = ref<any>();

	function buscardorGlobal(string: string) {
		//AQUI SE REALIZA LA BÚSQUEDA DEL STRING QUE INTRODUCE EL USUARIO¡
		let request = {
			query: string,
			fields: ["name", "geometry"],
		};

		props.placesService.findPlaceFromQuery(
			request,
			function (results, status) {
				if (
					status === google.maps.places.PlacesServiceStatus.OK &&
					results
				) {
					console.log("respuesta de google: ", results);
					console.log(
						"lat: ",
						results[0].geometry!.location?.lat() as number
					);
					console.log(
						"lng: ",
						results[0].geometry!.location?.lng() as number
					);

					items.value = [];
					items.value.push({ titulo: results[0].name });
					resultadosGoogle.value = results[0];

					// props.googleMap.setCenter({
					// 	lat: results[0].geometry!.location?.lat() as number,
					// 	lng: results[0].geometry!.location?.lng() as number,
					// });
					// props.googleMap.panTo({
					// 	lat: results[0].geometry!.location?.lat() as number,
					// 	lng: results[0].geometry!.location?.lng() as number,
					// });
					// for (var i = 0; i < results.length; i++) {
					// 	createMarker(results[i]);
					// }
				}
			}
		);
		console.log(string);
	}

	function centrarMapa() {
		try {
			// props.googleMap.setCenter({
			// 	lat: resultadosGoogle.value.geometry!.location?.lat() as number,
			// 	lng: resultadosGoogle.value.geometry!.location?.lng() as number,
			// });

			// props.googleMap.setCenter(
			// 	new google.maps.LatLng(
			// 		resultadosGoogle.value.geometry!.location?.lat() as number,
			// 		resultadosGoogle.value.geometry!.location?.lng() as number
			// 	)
			// );

			props.googleMap.panTo(
				new google.maps.LatLng(
					resultadosGoogle.value.geometry!.location?.lat() as number,
					resultadosGoogle.value.geometry!.location?.lng() as number
				)
			);
		} catch (error) {
			console.log(error);
		}
	}

	onMounted(async () => {});
</script>
<template>
	<v-card elevation="4"
		><v-card-title><h3>Buscador</h3></v-card-title>
		<v-row>
			<buscador
				:cols="12"
				:buscar-a-texto="texto"
				@buscar="buscardorGlobal($event)"
				class="mt-3 mr-3"
			/>
		</v-row>
		<v-row>
			<v-virtual-scroll :height="250" :items="items">
				<template v-for="objeto in items" v-slot:default="{ item }"
					><v-col cols="12">
						<v-card @click="centrarMapa">
							<h1>{{ item.titulo }}</h1>
						</v-card></v-col
					></template
				>
			</v-virtual-scroll>
		</v-row>
	</v-card>
</template>
<style scope></style>
