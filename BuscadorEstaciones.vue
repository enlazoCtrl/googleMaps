<script setup lang="ts">
	import { onMounted } from "vue";
	import { ref } from "vue";
	//import ListadoEstaciones from "./ListadoEstaciones.vue";

	const props = defineProps<{
		googleMap: google.maps.Map;
		placesService: google.maps.places.PlacesService;
	}>();

	let texto = ref("");
	let centerPosition: google.maps.LatLng = { lat: 0, lng: 0 };

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
					let location = {
						lat: results[0].geometry!.location?.lat() as number,
						lng: results[0].geometry!.location?.lng() as number,
						zoom: 6,
					};
					// let lat: number =
					// 	results[0].geometry!.location?.lat() as number;
					// centerPosition.lat =
					// 	results[0].geometry!.location?.lat();
					// centerPosition.lng =
					// 	results[0].geometry!.location?.lng() as number;

					props.googleMap.setCenter({
						lat: results[0].geometry!.location?.lat() as number,
						lng: results[0].geometry!.location?.lng() as number,
					});

					//AQUI REALIZO LAS ACCIONES CON LOS RESULTADOS DE LA BUSQUEDA DE GOOGLE MAPS

					// for (var i = 0; i < results.length; i++) {
					// 	createMarker(results[i]);
					// }
					// props.googleMap.setCenter(results[0].geometry.location);
				}
			}
		);
		console.log(string);
	}

	onMounted(async () => {});

	const items: any = [
		{
			titulo: "HOLA",
		},
		{
			titulo: "ADIOS",
		},
		{
			titulo: "COMO ESTAS",
		},
		{
			titulo: "BIEN",
		},
	];
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
						<v-card>
							<h1>{{ item.titulo }}</h1>
						</v-card></v-col
					></template
				>
			</v-virtual-scroll>
		</v-row>
	</v-card>
</template>
<style scope></style>
