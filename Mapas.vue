<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import axios from "@/plugins/axios";
	import { MarkerClusterer } from "@googlemaps/markerclusterer";
	import {
		ILocalizacion,
		ILocalizacionesF,
	} from "../../Interfaces/mapas/Localizaciones";
	import { IDetalleEstacion } from "../../Interfaces/mapas/detalleEstacion";
	import BuscadorEstaciones from "./BuscadorEstaciones.vue";

	const props = defineProps<{
		localizaciones: ILocalizacionesF[];
	}>();

	let googleMap = ref<google.maps.Map>();
	let infowindow = ref<google.maps.InfoWindow>();
	let service = ref<google.maps.places.PlacesService>();
	let geoLocation = ref<ILocalizacion>({ lat: 40.53926, lng: -3.69467 });
	let detalleEstacion: IDetalleEstacion[];
	let localizaciones: google.maps.Marker[] = [];
	let map = ref<google.maps.Map>();

	onMounted(async () => {
		console.log("estaciones de servicio: ", props.localizaciones);
		await initMap();
	});

	async function initMap() {
		navigator.geolocation.getCurrentPosition(
			function (position) {
				geoLocation.value.lat = position.coords.latitude;
				geoLocation.value.lng = position.coords.longitude;
			},
			function (error) {
				if (error.code == error.PERMISSION_DENIED)
					alert(
						"Permiso de geolocalización denegado, esto puede hacer que la app no funcione correctamente."
					);
			}
		);

		const { Map } = (await google.maps.importLibrary(
			"maps"
		)) as google.maps.MapsLibrary;

		const { PlacesService } = (await google.maps.importLibrary(
			"places"
		)) as google.maps.PlacesLibrary;

		// map.value = new window.google.maps.Map(
		// 	document.getElementById("googleMap")!
		// );
		// googleMap.value = new Map(
		// 	document.getElementById("googleMap") as HTMLElement,
		// 	{
		// 		center: geoLocation.value,
		// 		zoom: 6,
		// 	}
		// );

		map.value = new Map(document.getElementById("googleMap")! as any, {
			center: geoLocation.value,
			zoom: 6,
		});

		service.value = new PlacesService(map.value);
		infowindow.value = new google.maps.InfoWindow();

		for (let index = 0; index < props.localizaciones.length; index++) {
			let icon: string = "/src/assets/map_icon-";
			switch (props.localizaciones[index].agrupacion) {
				case "487":
					{
						icon += "1.png";
					}
					break;
				case "494":
					{
						icon += "2.png";
					}
					break;
				case "944":
					{
						icon += "3.png";
					}
					break;
				case "946":
					{
						icon += "4.png";
					}
					break;
				case "755":
					{
						icon += "5.png";
					}
					break;
				case "1093":
					{
						icon += "6.png";
					}
					break;

				default:
					break;
			}

			let marker = new google.maps.Marker({
				position: {
					lat: props.localizaciones[index].lat,
					lng: props.localizaciones[index].lng,
				},
				map: map.value,
				title: `titulo`,
				icon: `${icon}`,
			});
			localizaciones.push(marker);

			google.maps.event.addListener(marker, "click", async function () {
				detalleEstacion = await pedirDetalleEstacion(
					props.localizaciones[index].prv_codigo
				);
				let response = detalleEstacion[0];
				console.log("detalle estación: ", response);
				let contentString = `
	                   <div class="blog-slider">
	                       <h2>${response.titulo}</h2>
	       <div class="column precio">${response.precio}</div>
	       <div class="column contenido">
	           <table>
	           <tr><td>Marca: ${response.marca}</td></tr>
	           <tr><td>${response.horario}</td></tr>
	           <tr><td>${response.sentido}</td></tr>
	           <tr><td>${response.telefono}</td></tr>
	           <tr><td>${response.poblacion}</td></tr>
	           <tr><td>${response.provincia}</td></tr>
	           </table>
	          </div>
	          <div><h2>footer</h2></div>
	       </div>`;
				infowindow.value?.setContent(contentString);
				infowindow.value?.open(map.value, marker);
			});
		}
		map.value.addListener("click", function () {
			if (infowindow.value) infowindow.value?.close();
		});

		new MarkerClusterer({ map: map.value, markers: localizaciones });
	}

	async function pedirDetalleEstacion(codProveedor: number) {
		console.log(codProveedor);
		const { data } = await axios.get(
			`${import.meta.env.VITE_APP_BACKEND_NESTJS}${
				import.meta.env.VITE_APP_GENERAL
			}/detalleEstacionServicio?codProveedor=${codProveedor}`
		);
		return data;
	}
</script>
<template>
	<v-container fluid>
		<v-row justify="center">
			<v-col cols="12" class="pa-0">
				<buscador-estaciones
					v-if="map && service"
					:map="map"
					:places-service="service"
					class="card mt-15 ml-15 mb-15 pa-4"
				/>
				<div id="googleMap" ref="googleMap"></div>
			</v-col>
		</v-row>
	</v-container>
</template>
<style scope>
	#googleMap {
		border-radius: 5px;
		height: 500px;
		width: inherit;
	}
	.card {
		z-index: 1;
		position: absolute;
		width: 350px;
	}
	.button {
		background-color: bisque;
		border: none;
		padding: 5px 10px;
		text-align: center;
		display: inline-block;
		font-size: 14px;
		margin: 4px 2px;
		cursor: pointer;
		border-radius: 4px;
	}
	.infoWindowContent {
		text-align: center;
	}
	.column {
		float: left;
		width: 48%;
		padding: 0 10px;
	}
	.blog-slider {
		padding: 10px;
	}
	.precio {
		text-align: center;
		border-radius: 5px;
		padding: 1%;
		font-size: x-large;
		color: white;
		background-color: black;
		margin-top: 3%;
	}
	.contenido {
		margin-left: 4%;
	}
</style>
