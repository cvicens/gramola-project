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

package com.redhat.gramola.events.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.redhat.gramola.events.exception.NotFoundException;
import com.redhat.gramola.events.exception.UnprocessableEntityException;
import com.redhat.gramola.events.exception.UnsupportedMediaTypeException;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Spliterator;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping(value = "/api/events")
public class EventController {

    private final EventRepository repository;

    public EventController(EventRepository repository) {
        this.repository = repository;
    }
    
    @GetMapping({"/{country}/{city}", "/{country}/{city}/{date}"})
    public List<Event> findByCountryAndCityAndDateGreaterThanEqual(
    		@PathVariable("country") String country,
    		@PathVariable("city") String city,
    		@PathVariable("date") Optional<String> date) {

    	if (date.isPresent()) {
    		return repository.findByCountryAndCityAndDateGreaterThanEqual(country, city, date.get());
    	} else {
    		return repository.findByCountryAndCityAndDateGreaterThanEqual(country, city, "");
    	}
    }

    @GetMapping("/{id}")
    public Event get(@PathVariable("id") Integer id) {
        verifyEventExists(id);

        return repository.findOne(id);
    }

    @GetMapping
    public List<Event> getAll() {
        Spliterator<Event> events = repository.findAll()
                .spliterator();

        return StreamSupport
                .stream(events, false)
                .collect(Collectors.toList());
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public Event post(@RequestBody(required = false) Event event) {
        verifyCorrectPayload(event);

        return repository.save(event);
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/{id}")
    public Event put(@PathVariable("id") Integer id, @RequestBody(required = false) Event event) {
        verifyEventExists(id);
        verifyCorrectPayload(event);

        event.setId(id);
        return repository.save(event);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Integer id) {
        verifyEventExists(id);

        repository.delete(id);
    }

    private void verifyEventExists(Integer id) {
        if (!repository.exists(id)) {
            throw new NotFoundException(String.format("Event with id=%d was not found", id));
        }
    }

    private void verifyCorrectPayload(Event event) {
        if (Objects.isNull(event)) {
            throw new UnsupportedMediaTypeException("Invalid payload!");
        }

        if (Objects.isNull(event.getName()) || event.getName().trim().length() == 0 ||
        	Objects.isNull(event.getAddress()) || event.getAddress().trim().length() == 0 ||
        	Objects.isNull(event.getCity()) || event.getCity().trim().length() == 0 ||
        	Objects.isNull(event.getProvince()) || event.getProvince().trim().length() == 0 ||
        	Objects.isNull(event.getCountry()) || event.getCountry().trim().length() == 0 ||
        	Objects.isNull(event.getDate()) || event.getDate().trim().length() == 0 ||
        	Objects.isNull(event.getStartTime()) || event.getStartTime().trim().length() == 0 ||
        	Objects.isNull(event.getEndTime()) || event.getEndTime().trim().length() == 0 ||
        	Objects.isNull(event.getLocation()) || event.getLocation().trim().length() == 0 ||
        	Objects.isNull(event.getArtist()) || event.getArtist().trim().length() == 0) {
            throw new UnprocessableEntityException("All data but image and description is required!");
        }

        if (!Objects.isNull(event.getId())) {
            throw new UnprocessableEntityException("Id was invalidly set on request.");
        }
    }

}
