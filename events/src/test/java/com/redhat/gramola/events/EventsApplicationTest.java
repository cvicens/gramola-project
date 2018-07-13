/*
 * Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.redhat.gramola.events;

import java.util.Collections;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.redhat.gramola.events.service.Event;
import com.redhat.gramola.events.service.EventRepository;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.RestAssured.when;
import static org.hamcrest.CoreMatchers.hasItems;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.Matchers.isEmptyString;
import static org.junit.Assert.assertFalse;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class EventsApplicationTest {

    @Value("${local.server.port}")
    private int port;

    @Autowired
    private EventRepository eventRepository;

    @Before
    public void beforeTest() {
        eventRepository.deleteAll();
        RestAssured.baseURI = String.format("http://localhost:%d/api/events", port);
    }

    @Test
    public void testGetAll() {
        Event event1 = eventRepository.save(new Event("Event1", "Address1", "City1", "Province1", "Country1", "2018-07-01", "18:00", "23:00", "Location1", "Artist1", "Desc1", "Image1"));
        Event event2 = eventRepository.save(new Event("Event2", "Address2", "City2", "Province2", "Country2", "2018-07-01", "18:00", "23:00", "Location2", "Artist2", "Desc2", "Image2"));
        when().get()
                .then()
                .statusCode(200)
                .body("id", hasItems(event1.getId(), event2.getId()))
                .body("name", hasItems(event1.getName(), event2.getName()));
    }

    @Test
    public void testGetEmptyArray() {
        when().get()
                .then()
                .statusCode(200)
                .body(is("[]"));
    }

    @Test
    public void testGetOne() {
    	Event event1 = eventRepository.save(new Event("Event1", "Address1", "City1", "Province1", "Country1", "2018-07-01", "18:00", "23:00", "Location1", "Artist1", "Desc1", "Image1"));
        when().get(String.valueOf(event1.getId()))
                .then()
                .statusCode(200)
                .body("id", is(event1.getId()))
                .body("name", is(event1.getName()));
    }

    @Test
    public void testGetNotExisting() {
        when().get("0")
                .then()
                .statusCode(404);
    }

    @Test
    public void testPost() {
    	 String object = "{\n" + 
    		 		"    \"name\" : \"Guns 'n' Roses 2018\",\n" + 
    		 		"    \"address\" : \"Calle Alcalá 1\",\n" + 
    		 		"    \"city\" : \"MADRID\",\n" + 
    		 		"    \"province\" : \"MADRID\",\n" + 
    		 		"    \"country\" : \"SPAIN\",\n" + 
    		 		"    \"date\" : \"2018-07-05\",\n" + 
    		 		"    \"startTime\" : \"18:00\",\n" + 
    		 		"    \"endTime\" : \"21:00\",\n" + 
    		 		"    \"location\" : \"Plaza de toros de la Ventas\",\n" + 
    		 		"    \"artist\" : \"Guns 'n' Roses\",\n" + 
    		 		"    \"description\" : \"Lorem ipsum...\",\n" + 
    		 		"    \"image\" : \"images/guns-P1080795.png\"\n" + 
    		 		"}";
        given().contentType(ContentType.JSON)
                .body(object)
                .when()
                .post()
                .then()
                .statusCode(201)
                .body("id", not(isEmptyString()))
                .body("name", is("Guns 'n' Roses 2018"));
    }

    @Test
    public void testPostWithWrongPayload() {
        given().contentType(ContentType.JSON)
                .body(Collections.singletonMap("id", 0))
                .when()
                .post()
                .then()
                .statusCode(422);
    }

    @Test
    public void testPostWithNonJsonPayload() {
        given().contentType(ContentType.XML)
                .when()
                .post()
                .then()
                .statusCode(415);
    }

    @Test
    public void testPostWithEmptyPayload() {
        given().contentType(ContentType.JSON)
                .when()
                .post()
                .then()
                .statusCode(415);
    }

    @Test
    public void testPut() {
        Event event1 = eventRepository.save(new Event("Event1", "Address1", "City1", "Province1", "Country1", "2018-07-01", "18:00", "23:00", "Location1", "Artist1", "Desc1", "Image1"));
        String newEvent1 = "{\n" + 
		 		"    \"name\" : \"Guns 'n' Roses 2018\",\n" + 
		 		"    \"address\" : \"Calle Alcalá 1\",\n" + 
		 		"    \"city\" : \"MADRID\",\n" + 
		 		"    \"province\" : \"MADRID\",\n" + 
		 		"    \"country\" : \"SPAIN\",\n" + 
		 		"    \"date\" : \"2018-07-05\",\n" + 
		 		"    \"startTime\" : \"18:00\",\n" + 
		 		"    \"endTime\" : \"21:00\",\n" + 
		 		"    \"location\" : \"Plaza de toros de la Ventas\",\n" + 
		 		"    \"artist\" : \"Guns 'n' Roses\",\n" + 
		 		"    \"description\" : \"Lorem ipsum...\",\n" + 
		 		"    \"image\" : \"images/guns-P1080795.png\"\n" + 
		 		"}";
        given().contentType(ContentType.JSON)
                .body(newEvent1)
                .when()
                .put(String.valueOf(event1.getId()))
                .then()
                .statusCode(200)
                .body("id", is(event1.getId()))
                .body("name", is("Guns 'n' Roses 2018"));

    }

    @Test
    public void testPutNotExisting() {
        given().contentType(ContentType.JSON)
                .body(Collections.singletonMap("name", "Lemon"))
                .when()
                .put("/0")
                .then()
                .statusCode(404);
    }

    @Test
    public void testPutWithWrongPayload() {
    	Event event1 = eventRepository.save(new Event("Event1", "Address1", "City1", "Province1", "Country1", "2018-07-01", "18:00", "23:00", "Location1", "Artist1", "Desc1", "Image1"));
        given().contentType(ContentType.JSON)
                .body(Collections.singletonMap("id", 0))
                .when()
                .put(String.valueOf(event1.getId()))
                .then()
                .statusCode(422);
    }

    @Test
    public void testPutWithNonJsonPayload() {
    	Event event1 = eventRepository.save(new Event("Event1", "Address1", "City1", "Province1", "Country1", "2018-07-01", "18:00", "23:00", "Location1", "Artist1", "Desc1", "Image1"));
        given().contentType(ContentType.XML)
                .when()
                .put(String.valueOf(event1.getId()))
                .then()
                .statusCode(415);
    }

    @Test
    public void testPutWithEmptyPayload() {
        Event event1 = eventRepository.save(new Event("Event1", "Address1", "City1", "Province1", "Country1", "2018-07-01", "18:00", "23:00", "Location1", "Artist1", "Desc1", "Image1"));
        given().contentType(ContentType.JSON)
                .when()
                .put(String.valueOf(event1.getId()))
                .then()
                .statusCode(415);
    }

    @Test
    public void testDelete() {
        Event event1 = eventRepository.save(new Event("Event1", "Address1", "City1", "Province1", "Country1", "2018-07-01", "18:00", "23:00", "Location1", "Artist1", "Desc1", "Image1"));
        when().delete(String.valueOf(event1.getId()))
                .then()
                .statusCode(204);
        assertFalse(eventRepository.exists(event1.getId()));
    }

    @Test
    public void testDeleteNotExisting() {
        when().delete("/0")
                .then()
                .statusCode(404);
    }

}
